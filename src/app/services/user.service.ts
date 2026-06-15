import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserConfig } from '../interfaces/user-config.interface';

/**
 * Loads and caches the current user's config (role) from GET /api/me so the UI
 * can adapt to ADMIN / PLAYER / VIEWER.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly meUrl = `${environment.baseUrl}/api/me`;

  readonly me = signal<UserConfig | null>(null);
  readonly role = computed(() => (this.me()?.role ?? '').toUpperCase());
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isViewer = computed(() => this.role() === 'VIEWER');

  loadMe(): Observable<UserConfig> {
    return this.http.get<UserConfig>(this.meUrl).pipe(tap(config => this.me.set(config)));
  }

  clear(): void {
    this.me.set(null);
  }
}
