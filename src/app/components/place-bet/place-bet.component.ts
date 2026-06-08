import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Match } from '../../interfaces/match.interface';
import { MatchesService } from '../../services/matches.service';

@Component({
  selector: 'app-place-bet',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    TableModule,
    TagModule,
  ],
  templateUrl: './place-bet.component.html',
  styleUrl: './place-bet.component.css',
})
export class PlaceBetComponent implements OnInit {
  matches = signal<Match[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  selectedMatchNumber = signal<number | null>(null);

  betControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(30)],
  });

  selectedMatch = computed(() => {
    const matchNumber = this.selectedMatchNumber();
    return this.matches().find(match => match.matchNumber === matchNumber) ?? null;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchesService: MatchesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const matchNumber = Number(params.get('matchNumber'));
      this.selectedMatchNumber.set(Number.isFinite(matchNumber) ? matchNumber : null);
      this.prefillBet();
    });

    this.loadMatches();
  }

  loadMatches(): void {
    this.loading.set(true);
    this.error.set(null);

    this.matchesService.getUserMatches().subscribe({
      next: matches => {
        this.matches.set(matches);
        this.loading.set(false);
        this.prefillBet();
      },
      error: () => {
        this.error.set('Failed to load your matches. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  selectMatch(match: Match): void {
    this.success.set(null);
    this.error.set(null);
    this.selectedMatchNumber.set(match.matchNumber);
    this.prefillBet();
    this.router.navigate(['/place-bet', match.matchNumber]);
  }

  submitBet(): void {
    const match = this.selectedMatch();
    const result = this.betControl.value.trim();

    if (!match || this.betControl.invalid || !result) {
      this.betControl.markAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.matchesService.placeBet(match.matchNumber, result).subscribe({
      next: updatedMatch => {
        this.matches.update(matches =>
          matches.map(current =>
            current.matchNumber === match.matchNumber
              ? { ...current, result: updatedMatch?.result ?? result }
              : current
          )
        );
        this.success.set(`Bet saved for ${match.homeTeam} vs ${match.awayTeam}.`);
        this.submitting.set(false);
      },
      error: () => {
        this.error.set('Failed to place bet. Check your session and try again.');
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private prefillBet(): void {
    const currentResult = this.selectedMatch()?.result ?? '';
    this.betControl.setValue(currentResult);
    this.betControl.markAsPristine();
  }
}
