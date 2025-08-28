import {CommonModule } from '@angular/common';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {TooltipModule} from 'primeng/tooltip';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewInit, Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {ThemeService} from '../../services/theme.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    MessageModule,
    TooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  errorMessage = '';
  isDarkMode = false;
  isMobile = false;
  isTablet = false;

  private destroy$ = new Subject<void>();
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToHome();
    }

    // Subscribe to auth state changes
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.redirectToHome();
      }
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

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view initialization with multiple attempts
    this.renderGoogleButtonWithRetry();
  }

  ngOnDestroy(): void {
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

  private renderGoogleButtonWithRetry(attempts: number = 0): void {
    const maxAttempts = 5;

    if (attempts >= maxAttempts) {
      console.error('Failed to render Google button after maximum attempts');
      return;
    }

    setTimeout(() => {
      if (this.googleButton?.nativeElement) {
        console.log(`Attempting to render Google button (attempt ${attempts + 1})`);
        this.authService.renderGoogleButton(this.googleButton.nativeElement);
      } else {
        console.warn(`Google button element not ready, retrying... (attempt ${attempts + 1})`);
        this.renderGoogleButtonWithRetry(attempts + 1);
      }
    }, attempts === 0 ? 100 : 1000); // First attempt after 100ms, subsequent attempts after 1s
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private redirectToHome(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }
}
