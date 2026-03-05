import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';
import { CanActivateFn, Router } from '@angular/router';

export const canActivate: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    map((isLoggedIn) => {
      if (!isLoggedIn) {
        return router.createUrlTree(['/login']);
      }
      return true;
    }),
  );
};

export const canActivateRole: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['allowedRoles'] as string[]) || [];

  return authService.role$.pipe(
    map((role) => {
      if (!role || !allowedRoles.some((r) => role.includes(r))) {
        return router.createUrlTree(['/dashboard']);
      }
      return true;
    }),
  );
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) =>
      isLogged ? true : router.createUrlTree(['/auth/login']),
    ),
  );
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) => (isLogged ? router.createUrlTree(['/dashboard']) : true)),
  );
};
