import {CommonModule } from '@angular/common';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {TooltipModule} from 'primeng/tooltip';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {ThemeService} from '../../services/theme.service';

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
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  errorMessage = '';
  isDarkMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToHome();
    }

    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.redirectToHome();
      }
    });

    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe((isDark: boolean) => {
      this.isDarkMode = isDark;
    });
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view initialization
    setTimeout(() => {
      if (this.googleButton?.nativeElement) {
        this.authService.renderGoogleButton(this.googleButton.nativeElement);
      }
    }, 500);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private redirectToHome(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }
}
