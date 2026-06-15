export interface MatchBet {
  matchNumber: number;
  roundNumber: number;
  date: string | null;
  location: string;
  homeTeam: string;
  awayTeam: string;
  group: string;
  bet: string | null;
  dateOfLastBet: string | null;
}
