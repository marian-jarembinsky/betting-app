import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match } from '../interfaces/match.interface';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private readonly apiUrl = `${environment.baseUrl}/api/matches`;
  private readonly userMatchesUrl = `${environment.baseUrl}/api/user/matches`;

  constructor(private http: HttpClient) {}

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }

  getUserMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.userMatchesUrl);
  }

  placeBet(matchNumber: number, result: string): Observable<Match> {
    return this.http.put<Match>(`${this.apiUrl}/${matchNumber}/result`, { result });
  }
}
