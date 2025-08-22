import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {BehaviorSubject, Observable} from 'rxjs';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  rawToken?: string; // Add raw JWT token
}

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<GoogleUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isGoogleInitialized = false;
  private rawJwtToken: string | null = null;
  private isBrowser: boolean;

  // Replace with your actual Google OAuth2 Client ID
  private readonly GOOGLE_CLIENT_ID = '258929424671-34jiosobemmk9ua84huved7tnp4uvd71.apps.googleusercontent.com';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadGoogleScript();
      // Check if user is already logged in from localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  private loadGoogleScript(): void {
    if (!this.isBrowser) return;

    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.initializeGoogleAuth();
      };
      document.head.appendChild(script);
    } else if (typeof window !== 'undefined' && window.google) {
      this.initializeGoogleAuth();
    }
  }

  private initializeGoogleAuth(): void {
    if (!this.isBrowser) return;

    if (typeof window !== 'undefined' && window.google && !this.isGoogleInitialized) {
      window.google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      this.isGoogleInitialized = true;
    }
  }

  private handleGoogleResponse(response: any): void {
    if (!this.isBrowser) return;

    try {
      // Store the raw JWT token
      this.rawJwtToken = response.credential;

      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));

      const user: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        rawToken: response.credential
      };

      // Check if user is authorized
      if (this.isAuthorizedUser(user.email)) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('jwtToken', response.credential);
        this.currentUserSubject.next(user);
      } else {
        console.error('Unauthorized user attempted to login:', user.email);
        alert('Access denied. You are not authorized to access this application.');
        this.logout();
      }
    } catch (error) {
      console.error('Error processing Google response:', error);
    }
  }

  private isAuthorizedUser(email: string): boolean {
    // Define authorized admin emails here
    const authorizedEmails = [
      'admin@yourdomain.com',
      'jarembinsky.marian@gmail.com',
      // Add your authorized admin emails here
    ];

    return authorizedEmails.includes(email);
  }

  signInWithGoogle(): Observable<boolean> {
    return new Observable(observer => {
      if (!this.isBrowser) {
        observer.next(false);
        observer.complete();
        return;
      }

      if (this.isGoogleInitialized && typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            observer.next(false);
            observer.complete();
          }
        });

        // Set up a listener for successful login
        const subscription = this.currentUser$.subscribe(user => {
          if (user) {
            observer.next(true);
            observer.complete();
            subscription.unsubscribe();
          }
        });
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  renderGoogleButton(element: HTMLElement): void {
    if (!this.isBrowser) return;

    if (this.isGoogleInitialized && typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
    }
  }

  logout(): void {
    if (!this.isBrowser) return;

    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('jwtToken');
    }
    this.rawJwtToken = null;
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): GoogleUser | null {
    return this.currentUserSubject.value;
  }

  getRawToken(): string | null {
    if (!this.isBrowser) return null;

    return this.rawJwtToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('jwtToken') : null);
  }

  getDecodedToken(): any {
    const token = this.getRawToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    // For now, all authenticated users have full permissions
    return user !== null;
  }
}
