import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatchBet } from '../interfaces/match-bet.interface';
import { UpdateResultResponse } from '../interfaces/update-result-response.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly adminUrl = `${environment.baseUrl}/api/admin`;

  /** Every registered user's bets, keyed by email. */
  getAllBets(): Observable<Record<string, MatchBet[]>> {
    return this.http.get<Record<string, MatchBet[]>>(`${this.adminUrl}/bets`);
  }

  getUserBets(email: string): Observable<MatchBet[]> {
    return this.http.get<MatchBet[]>(`${this.adminUrl}/bets/${encodeURIComponent(email)}`);
  }

  /** Writes the official result for a match into the general matches sheet. */
  setOfficialResult(matchNumber: number, result: string): Observable<UpdateResultResponse> {
    return this.http.put<UpdateResultResponse>(
      `${this.adminUrl}/matches/${matchNumber}/result`,
      { result }
    );
  }
}
