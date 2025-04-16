import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$().pipe(
    map(isAuth => {
      if (isAuth) {
        return true;
      } else {
        const returnUrl = state.url === '/reserva' ? '/home' : state.url;
        router.navigate(['/login'], { queryParams: { returnUrl } });
        return false;
      }
    })
  );
};
