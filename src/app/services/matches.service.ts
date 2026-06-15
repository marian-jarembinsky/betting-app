import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match } from '../interfaces/match.interface';
import { MatchBet } from '../interfaces/match-bet.interface';
import { UpdateResultResponse } from '../interfaces/update-result-response.interface';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  private readonly apiUrl = `${environment.baseUrl}/api/matches`;
  private readonly userMatchesUrl = `${environment.baseUrl}/api/user/matches`;

  constructor(private http: HttpClient) {}

  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.apiUrl);
  }

  getUserMatches(): Observable<MatchBet[]> {
    return this.http.get<MatchBet[]>(this.userMatchesUrl);
  }

  placeBet(matchNumber: number, bet: string): Observable<UpdateResultResponse> {
    return this.http.put<UpdateResultResponse>(`${this.apiUrl}/${matchNumber}/result`, { result: bet });
  }
}
