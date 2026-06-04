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
  private readonly tokenKey = 'google_credential';

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
      sessionStorage.setItem(this.tokenKey, credential);
      // Remove any old token previously stored with localStorage.
      localStorage.removeItem(this.tokenKey);
    } catch {
      console.error('Failed to parse Google credential');
    }
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  restoreSession(): void {
    const stored = sessionStorage.getItem(this.tokenKey);
    // One-time cleanup of any token left from previous localStorage implementation.
    localStorage.removeItem(this.tokenKey);

    if (stored) {
      try {
        // Check token expiry (exp claim)
        const payload = this.decodeJwt(stored);
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          sessionStorage.removeItem(this.tokenKey);
          return;
        }
        this.setUser(stored);
      } catch {
        sessionStorage.removeItem(this.tokenKey);
      }
    }
  }
}
