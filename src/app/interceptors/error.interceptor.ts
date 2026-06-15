import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

/**
 * Centralises auth-related HTTP failures. On 401 (missing/expired token) the
 * session is cleared so the UI falls back to the sign-in screen. Errors are
 * re-thrown so component-level handlers can still show contextual messages.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const userService = inject(UserService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        userService.clear();
      }
      return throwError(() => error);
    })
  );
};
