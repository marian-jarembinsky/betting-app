import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SheetsService } from '../../services/sheets.service';
import { ChampionsLeagueMatch } from '../../interfaces';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-champions-league',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    MessageModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './champions-league.component.html',
  styleUrl: './champions-league.component.css'
})
export class ChampionsLeagueComponent implements OnInit, OnDestroy {
  matches: ChampionsLeagueMatch[] = [];
  filteredMatches: ChampionsLeagueMatch[] = [];
  loading = false;
  isApiReady = false;

  // Dialog properties
  displayAddDialog = false;
  displayEditDialog = false;
  selectedMatch: ChampionsLeagueMatch = this.createEmptyMatch();

  // Filter properties
  selectedRound = '';
  selectedStatus = '';

  rounds = [
    { label: 'All Rounds', value: '' },
    { label: 'Round 1 (Group Stage)', value: '1' },
    { label: 'Round 2 (Round of 16)', value: '2' },
    { label: 'Round 3 (Quarter Finals)', value: '3' },
    { label: 'Round 4 (Semi Finals)', value: '4' },
    { label: 'Round 5 (Final)', value: '5' }
  ];

  statuses = [
    { label: 'All Statuses', value: '' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Live', value: 'live' },
    { label: 'Finished', value: 'finished' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private sheetsService: SheetsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.checkApiReadiness();
    this.loadMatches();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkApiReadiness() {
    // Check periodically if API is ready
    const checkInterval = setInterval(() => {
      if (this.sheetsService.isReady()) {
        this.isApiReady = true;
        this.loadMatches();
        clearInterval(checkInterval);
      }
    }, 1000);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this.isApiReady) {
        this.messageService.add({
          severity: 'error',
          summary: 'API Error',
          detail: 'Failed to connect to Google Sheets API'
        });
      }
    }, 30000);
  }

  loadMatches() {
    if (!this.isApiReady) return;

    this.loading = true;
    this.sheetsService.getMatches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (matches) => {
          this.matches = matches;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading matches:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Load Error',
            detail: 'Failed to load Champions League data'
          });
          this.loading = false;
        }
      });
  }

  applyFilters() {
    this.filteredMatches = this.matches.filter(match => {
      const roundMatch = !this.selectedRound || match.roundNumber.toString() === this.selectedRound;
      const statusMatch = !this.selectedStatus || match.status === this.selectedStatus;
      return roundMatch && statusMatch;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'finished': return 'success';
      case 'live': return 'danger';
      case 'scheduled': return 'info';
      default: return 'info';
    }
  }

  showAddDialog() {
    this.selectedMatch = this.createEmptyMatch();
    this.displayAddDialog = true;
  }

  showEditDialog(match: ChampionsLeagueMatch) {
    this.selectedMatch = { ...match };
    this.displayEditDialog = true;
  }

  async saveMatch() {
    if (!this.validateMatch(this.selectedMatch)) {
      return;
    }

    this.loading = true;
    try {
      const success = await this.sheetsService.addNewMatch(this.selectedMatch);
      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Match added successfully'
        });
        this.displayAddDialog = false;
      } else {
        throw new Error('Failed to add match');
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Save Error',
        detail: 'Failed to add match'
      });
    }
    this.loading = false;
  }

  async updateMatch() {
    if (!this.validateMatch(this.selectedMatch) || !this.selectedMatch.matchNumber) {
      return;
    }

    this.loading = true;
    try {
      // Format the result string for the new spreadsheet format
      const result = (this.selectedMatch.homeScore !== undefined && this.selectedMatch.awayScore !== undefined)
        ? `${this.selectedMatch.homeScore}-${this.selectedMatch.awayScore}`
        : '';

      const success = await this.sheetsService.updateMatchResult(
        this.selectedMatch.matchNumber,
        result
      );

      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Match updated successfully'
        });
        this.displayEditDialog = false;
      } else {
        throw new Error('Failed to update match');
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Update Error',
        detail: 'Failed to update match'
      });
    }
    this.loading = false;
  }

  async refreshData() {
    this.loading = true;
    try {
      await this.sheetsService.refreshData();
      this.messageService.add({
        severity: 'success',
        summary: 'Refreshed',
        detail: 'Data refreshed successfully'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Refresh Error',
        detail: 'Failed to refresh data'
      });
    }
    this.loading = false;
  }

  private validateMatch(match: ChampionsLeagueMatch): boolean {
    if (!match.homeTeam || !match.awayTeam || !match.roundNumber || !match.date) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields (teams, round, and date)'
      });
      return false;
    }
    return true;
  }

  private createEmptyMatch(): ChampionsLeagueMatch {
    return {
      matchNumber: this.getNextMatchNumber(),
      roundNumber: 1,
      date: '',
      location: '',
      homeTeam: '',
      awayTeam: '',
      result: '',
      homeScore: undefined,
      awayScore: undefined,
      status: 'scheduled'
    };
  }

  private getNextMatchNumber(): number {
    if (this.matches.length === 0) return 1;
    return Math.max(...this.matches.map(m => m.matchNumber)) + 1;
  }

  cancelDialog() {
    this.displayAddDialog = false;
    this.displayEditDialog = false;
    this.selectedMatch = this.createEmptyMatch();
  }
}
