import { Injectable, signal } from '@angular/core';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<GoogleUser | null>(null);

  private decodeJwt(token: string): any {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  }

  setUser(credential: string): void {
    try {
      const payload = this.decodeJwt(credential);
      this.currentUser.set({
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        sub: payload.sub,
      });
      localStorage.setItem('google_credential', credential);
    } catch {
      console.error('Failed to parse Google credential');
    }
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('google_credential');
  }

  restoreSession(): void {
    const stored = localStorage.getItem('google_credential');
    if (stored) {
      try {
        // Check token expiry (exp claim)
        const payload = this.decodeJwt(stored);
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('google_credential');
          return;
        }
        this.setUser(stored);
      } catch {
        localStorage.removeItem('google_credential');
      }
    }
  }
}

