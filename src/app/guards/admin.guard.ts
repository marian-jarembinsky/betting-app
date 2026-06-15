import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { UserService } from '../services/user.service';

/**
 * Allows access only to ADMIN users. If the role hasn't been loaded yet it is
 * fetched from /api/me; any failure (or non-admin role) redirects to home.
 */
export const adminGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.me()) {
    return userService.isAdmin() ? true : router.parseUrl('/');
  }

  return userService.loadMe().pipe(
    map(() => (userService.isAdmin() ? true : router.parseUrl('/'))),
    catchError(() => of(router.parseUrl('/')))
  );
};
