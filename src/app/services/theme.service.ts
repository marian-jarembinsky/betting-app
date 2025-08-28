import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$: Observable<boolean> = this.isDarkModeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Check for saved theme preference or default to system preference
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      this.setTheme(isDark);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.isDarkModeSubject.value;
    this.setTheme(!currentTheme);
  }

  private setTheme(isDark: boolean): void {
    if (!this.isBrowser) return;

    this.isDarkModeSubject.next(isDark);

    // Apply the theme class to document element for PrimeNG v19
    const documentElement = document.documentElement;

    if (isDark) {
      documentElement.classList.add('app-dark');
      documentElement.classList.remove('app-light');
    } else {
      documentElement.classList.add('app-light');
      documentElement.classList.remove('app-dark');
    }

    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  get isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
