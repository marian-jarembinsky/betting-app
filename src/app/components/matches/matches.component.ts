import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MatchesService } from '../../services/matches.service';
import { Match } from '../../interfaces/match.interface';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TableModule,
    TabsModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
  ],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css',
})
export class MatchesComponent implements OnInit {
  matches = signal<Match[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Unique sorted group names
  groups = computed(() =>
    [...new Set(this.matches().map(m => m.group))].sort()
  );

  // Matches grouped by group name
  matchesByGroup = computed(() => {
    const map = new Map<string, Match[]>();
    for (const group of this.groups()) {
      map.set(group, this.matches().filter(m => m.group === group));
    }
    return map;
  });

  constructor(
    private matchesService: MatchesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.matchesService.getMatches().subscribe({
      next: data => {
        this.matches.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load matches. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  getMatchesForGroup(group: string): Match[] {
    return this.matchesByGroup().get(group) ?? [];
  }

  placeBet(match: Match): void {
    this.router.navigate(['/place-bet', match.matchNumber]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}




