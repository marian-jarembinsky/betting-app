import {Injectable, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {BehaviorSubject, Observable} from 'rxjs';
import { GoogleUser } from '../interfaces/user.interface';

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
  private isBrowser: boolean;
  private isGoogleLoaded = false;

  private readonly GOOGLE_CLIENT_ID = '258929424671-34jiosobemmk9ua84huved7tnp4uvd71.apps.googleusercontent.com';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadGoogleScript();
      // Check if user is already logged in from localStorage
      const savedUser = this.getStoredUser();
      if (savedUser) {
        this.currentUserSubject.next(savedUser);
      }
    }
  }

  private getStoredUser(): GoogleUser | null {
    if (!this.isBrowser || typeof localStorage === 'undefined') return null;

    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  private loadGoogleScript(): void {
    if (!this.isBrowser || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.isGoogleLoaded = true;
      this.initializeGoogle();
    };
    document.head.appendChild(script);
  }

  private initializeGoogle(): void {
    if (!this.isBrowser || typeof window === 'undefined' || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleCredentialResponse(response)
    });
  }

  private handleCredentialResponse(response: any): void {
    try {
      const payload = JSON.parse(this.decodeJWTPayload(response.credential.split('.')[1]));

      const user: GoogleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        given_name: payload.given_name,
        family_name: payload.family_name,
        rawToken: response.credential
      };

      if (this.isAuthorizedUser(user.email)) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('jwtToken', response.credential);
        }
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

  private decodeJWTPayload(base64Url: string): string {
    // Replace URL-safe characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to binary string
    const binaryString = atob(base64);

    // Convert binary string to UTF-8
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode UTF-8 bytes to string
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  private isAuthorizedUser(email: string): boolean {
    const authorizedEmails = [
      'admin@yourdomain.com',
      'jarembinsky.marian@gmail.com',
    ];
    return authorizedEmails.includes(email);
  }

  renderGoogleButton(element: HTMLElement): void {
    if (!this.isBrowser || typeof window === 'undefined') return;

    const renderButton = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%'
        });
      }
    };

    if (this.isGoogleLoaded) {
      renderButton();
    } else {
      // Wait for Google to load
      const checkGoogle = setInterval(() => {
        if (this.isGoogleLoaded && window.google) {
          clearInterval(checkGoogle);
          renderButton();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle);
      }, 10000);
    }
  }

  logout(): void {
    if (this.isBrowser) {
      if (typeof window !== 'undefined' && window.google) {
        window.google.accounts.id.disableAutoSelect();
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('jwtToken');
      }
    }
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
    return typeof localStorage !== 'undefined' ? localStorage.getItem('jwtToken') : null;
  }

  getDecodedToken(): any {
    const token = this.getRawToken();
    if (!token) return null;

    try {
      return JSON.parse(this.decodeJWTPayload(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  }
}
