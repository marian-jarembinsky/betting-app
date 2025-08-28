import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService, GoogleUser } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home-dashboard',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ProgressSpinnerModule,
    ToolbarModule,
    TooltipModule
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css'
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
  user: GoogleUser | null = null;
  isAuthenticated = false;
  isLoading = true;
  isDarkMode = false;
  isMobile = false;
  isTablet = false;

  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService,
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.auth.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
      this.isLoading = false;
    });

    // Subscribe to theme changes
    this.themeService.isDarkMode$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });

    // Initialize responsive detection
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize() {
    if (this.isBrowser && typeof window !== 'undefined') {
      const width = window.innerWidth;
      this.isMobile = width < 768;
      this.isTablet = width >= 768 && width < 992;
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
