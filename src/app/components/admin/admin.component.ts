import { CommonModule, DatePipe, KeyValuePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Match } from '../../interfaces/match.interface';
import { MatchBet } from '../../interfaces/match-bet.interface';
import { MatchesService } from '../../services/matches.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    KeyValuePipe,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private matchesService = inject(MatchesService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  matches = signal<Match[]>([]);
  allBets = signal<Record<string, MatchBet[]>>({});
  loading = signal(true);
  error = signal<string | null>(null);
  savingMatch = signal<number | null>(null);

  // matchNumber -> result input value
  resultInputs: Record<number, string> = {};

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.error.set(null);

    this.matchesService.getMatches().subscribe({
      next: matches => {
        this.matches.set(matches);
        for (const match of matches) {
          this.resultInputs[match.matchNumber] = match.result ?? '';
        }
      },
      error: () => this.error.set('Failed to load matches.'),
    });

    this.adminService.getAllBets().subscribe({
      next: bets => {
        this.allBets.set(bets);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load bets.');
        this.loading.set(false);
      },
    });
  }

  saveResult(match: Match): void {
    const result = (this.resultInputs[match.matchNumber] ?? '').trim();
    if (!result) {
      return;
    }
    this.savingMatch.set(match.matchNumber);
    this.error.set(null);

    this.adminService.setOfficialResult(match.matchNumber, result).subscribe({
      next: response => {
        this.matches.update(list =>
          list.map(current =>
            current.matchNumber === match.matchNumber
              ? { ...current, result: response.result }
              : current
          )
        );
        this.savingMatch.set(null);
      },
      error: () => {
        this.error.set(`Failed to save official result for match ${match.matchNumber}.`);
        this.savingMatch.set(null);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
