import {CommonModule } from '@angular/common';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {MessageModule} from 'primeng/message';
import {ActivatedRoute, Router} from '@angular/router';
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    MessageModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
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
  }

  ngAfterViewInit(): void {
    // Render Google Sign-In button after view initialization
    setTimeout(() => {
      if (this.googleButton?.nativeElement) {
        this.authService.renderGoogleButton(this.googleButton.nativeElement);
      }
    }, 500);
  }

  private redirectToHome(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.router.navigate([returnUrl]);
  }
}
