import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from, throwError, of, Subject } from 'rxjs';
import { map, catchError, switchMap, tap, share, shareReplay } from 'rxjs/operators';
import {
  ChampionsLeagueMatch,
  GoogleSheetsApiResponse,
  GoogleSheetsUpdateResponse,
  GoogleSheetsAppendResponse
} from '../interfaces';

declare global {
  interface Window {
    gapi: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SheetsService {
  private isBrowser: boolean;
  private isGapiLoaded = false;
  private isApiReady = false;
  private initializationSubject = new Subject<void>();

  // You'll need to get these from Google Cloud Console
  private readonly GOOGLE_API_KEY = 'AIzaSyDhRBnGmOvuCPrSBNZn-QfHjq6R3ysjKHE'; // Replace with your API key
  private readonly SPREADSHEET_ID = '1sVF9u6yN11WOpPCv-yfroIHnEQKZjbTqGmBl01hRdRQ'; // Replace with your spreadsheet ID
  private readonly DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

  private matchesSubject = new BehaviorSubject<ChampionsLeagueMatch[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  // Observable for API ready state
  private apiReadySubject = new BehaviorSubject<boolean>(false);
  public apiReady$ = this.apiReadySubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadGoogleSheetsApi();
    }
  }

  private loadGoogleSheetsApi(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;

    // Load Google API script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGapi().subscribe();
    };
    script.onerror = () => {
      console.error('Failed to load Google API script');
    };
    document.head.appendChild(script);
  }

  private initializeGapi(): Observable<void> {
    return new Observable<void>(observer => {
      if (!window.gapi) {
        observer.error(new Error('Google API not loaded'));
        return;
      }

      window.gapi.load('client', {
        callback: () => {
          from(window.gapi.client.init({
            apiKey: this.GOOGLE_API_KEY,
            discoveryDocs: [this.DISCOVERY_DOC]
          })).pipe(
            tap(() => {
              this.isGapiLoaded = true;
              this.isApiReady = true;
              this.apiReadySubject.next(true);
              console.log('Google Sheets API initialized successfully');
            }),
            switchMap(() => this.loadChampionsLeagueData()),
            catchError(error => {
              console.error('Error initializing Google API:', error);
              this.apiReadySubject.next(false);
              return throwError(() => error);
            })
          ).subscribe({
            next: () => {
              observer.next();
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        onerror: () => observer.error(new Error('Failed to load GAPI client'))
      });
    }).pipe(
      shareReplay(1)
    );
  }

  public loadChampionsLeagueData(): Observable<ChampionsLeagueMatch[]> {
    if (!this.isApiReady) {
      return throwError(() => new Error('Google Sheets API not initialized'));
    }

    return new Observable<GoogleSheetsApiResponse>(observer => {
      window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: 'Sheet1!A:G' // Updated range for 7 columns: Match Number, Round Number, Date, Location, Home Team, Away Team, Result
      }).then((response: GoogleSheetsApiResponse) => {
        observer.next(response);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    }).pipe(
      map((response: GoogleSheetsApiResponse) => {
        const values = response.result?.values || [];
        return this.parseMatchData(values);
      }),
      tap(matches => this.matchesSubject.next(matches)),
      catchError(error => {
        console.error('Error loading Champions League data:', error);
        return throwError(() => error);
      })
    );
  }

  private parseMatchData(values: any[][]): ChampionsLeagueMatch[] {
    if (values.length <= 1) return []; // No data or only headers

    const headers = values[0];
    const dataRows = values.slice(1);

    return dataRows.map((row, index) => {
      // Parse the result string (e.g., "2-1") into individual scores
      const result = row[6] || '';
      const { homeScore, awayScore, status } = this.parseResult(result);

      const match: ChampionsLeagueMatch = {
        matchNumber: row[0] ? parseInt(row[0]) : index + 1,
        roundNumber: row[1] ? parseInt(row[1]) : 1,
        date: this.parseDate(row[2] || ''),
        location: row[3] || '',
        homeTeam: row[4] || '',
        awayTeam: row[5] || '',
        result: result,
        homeScore: homeScore,
        awayScore: awayScore,
        status: status
      };
      return match;
    });
  }

  private parseDate(dateValue: string): string {
    if (!dateValue || dateValue.trim() === '') {
      return '';
    }

    try {
      // Handle format: "16/09/2025 18:45:00"
      if (dateValue.includes('/') && dateValue.includes(':')) {
        const [datePart, timePart] = dateValue.split(' ');
        const [day, month, year] = datePart.split('/');

        // Convert to ISO format: YYYY-MM-DD HH:MM:SS
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        if (timePart) {
          return `${isoDate} ${timePart}`;
        }
        return isoDate;
      }

      // Handle other possible date formats
      if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // If already in ISO format or unknown format, return as is
      return dateValue;
    } catch (error) {
      console.warn('Error parsing date:', dateValue, error);
      return dateValue; // Return original value if parsing fails
    }
  }

  private parseResult(result: string): { homeScore?: number, awayScore?: number, status: 'scheduled' | 'live' | 'finished' } {
    if (!result || result.trim() === '') {
      return { status: 'scheduled' };
    }

    // Check for common result patterns like "2-1", "0-0", etc.
    const scoreRegex = /^(\d+)-(\d+)$/;
    const match = result.trim().match(scoreRegex);

    if (match) {
      return {
        homeScore: parseInt(match[1]),
        awayScore: parseInt(match[2]),
        status: 'finished'
      };
    }

    // Check for live match indicators
    if (result.toLowerCase().includes('live') || result.toLowerCase().includes('playing')) {
      return { status: 'live' };
    }

    // Default to scheduled if result format is not recognized
    return { status: 'scheduled' };
  }

  public updateMatchResult(matchNumber: number, result: string): Observable<boolean> {
    if (!this.isApiReady) {
      return throwError(() => new Error('Google Sheets API not initialized'));
    }

    // Find the row index based on match number
    return this.matches$.pipe(
      switchMap(matches => {
        const match = matches.find(m => m.matchNumber === matchNumber);
        if (!match) {
          return throwError(() => new Error(`Match with number ${matchNumber} not found`));
        }

        const rowIndex = matchNumber + 1; // +1 because of header row

        return new Observable<GoogleSheetsUpdateResponse>(observer => {
          window.gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.SPREADSHEET_ID,
            range: `Sheet1!G${rowIndex}`, // Update Result column (G)
            valueInputOption: 'RAW',
            resource: {
              values: [[result]]
            }
          }).then((response: GoogleSheetsUpdateResponse) => {
            observer.next(response);
            observer.complete();
          }).catch((error: any) => {
            observer.error(error);
          });
        });
      }),
      switchMap((updateResponse: GoogleSheetsUpdateResponse) => {
        if (updateResponse.status === 200) {
          // Reload data to reflect changes
          return this.loadChampionsLeagueData().pipe(map(() => true));
        }
        return of(false);
      }),
      catchError(error => {
        console.error('Error updating match result:', error);
        return throwError(() => error);
      })
    );
  }

  public addNewMatch(match: ChampionsLeagueMatch): Observable<boolean> {
    if (!this.isApiReady) {
      return throwError(() => new Error('Google Sheets API not initialized'));
    }

    const values = [[
      match.matchNumber.toString(),
      match.roundNumber.toString(),
      match.date,
      match.location,
      match.homeTeam,
      match.awayTeam,
      match.result || ''
    ]];

    return new Observable<GoogleSheetsAppendResponse>(observer => {
      window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.SPREADSHEET_ID,
        range: 'Sheet1!A:G', // Updated range for new format
        valueInputOption: 'RAW',
        resource: { values }
      }).then((response: GoogleSheetsAppendResponse) => {
        observer.next(response);
        observer.complete();
      }).catch((error: any) => {
        observer.error(error);
      });
    }).pipe(
      switchMap((response: GoogleSheetsAppendResponse) => {
        if (response.status === 200) {
          // Reload data to reflect changes
          return this.loadChampionsLeagueData().pipe(map(() => true));
        }
        return of(false);
      }),
      catchError(error => {
        console.error('Error adding new match:', error);
        return throwError(() => error);
      })
    );
  }

  public getMatches(): Observable<ChampionsLeagueMatch[]> {
    return this.matches$;
  }

  public getMatchesByRound(roundNumber: number): Observable<ChampionsLeagueMatch[]> {
    return this.matches$.pipe(
      map(matches => matches.filter(match => match.roundNumber === roundNumber))
    );
  }

  public getFinishedMatches(): Observable<ChampionsLeagueMatch[]> {
    return this.matches$.pipe(
      map(matches => matches.filter(match => match.status === 'finished'))
    );
  }

  public getUpcomingMatches(): Observable<ChampionsLeagueMatch[]> {
    return this.matches$.pipe(
      map(matches => matches.filter(match => match.status === 'scheduled'))
    );
  }

  public refreshData(): Observable<void> {
    if (this.isApiReady) {
      return this.loadChampionsLeagueData().pipe(map(() => void 0));
    }
    return throwError(() => new Error('Google Sheets API not ready'));
  }

  public isReady(): Observable<boolean> {
    return this.apiReady$;
  }

  public isReadySync(): boolean {
    return this.isApiReady;
  }
}
