import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from './services/auth.service';

declare const google: any;

// ⚠️  Replace with your actual Google OAuth Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = '418236255659-gmo2902rbluc5t85h8d2too2bq72kol4.apps.googleusercontent.com';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    TooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef;

  protected auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.auth.restoreSession();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogle();
    }
  }

  private initGoogle(): void {
    const tryInit = () => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => this.auth.setUser(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        this.renderButton();
      } else {
        setTimeout(tryInit, 150);
      }
    };
    tryInit();
  }

  private renderButton(): void {
    if (!this.googleBtn?.nativeElement) return;
    google.accounts.id.renderButton(this.googleBtn.nativeElement, {
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 280,
    });
  }

  logout(): void {
    this.auth.logout();
    // Re-render button after logout on next tick
    setTimeout(() => this.renderButton(), 100);
  }

  goToPlaceBet(): void {
    this.router.navigate(['/place-bet']);
  }
}
