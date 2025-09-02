/**
 * Champions League match interface
 */

export interface ChampionsLeagueMatch {
  matchNumber: number;
  roundNumber: number;
  date: string;
  location: string;
  homeTeam: string;
  awayTeam: string;
  result?: string; // This will contain the match result like "2-1" or empty if not played
  // Derived properties for easier use
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
}
