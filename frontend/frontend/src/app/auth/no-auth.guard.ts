import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../api.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$().pipe(
    map(isAuth => {
      if (isAuth) {
        router.navigate(['/home']);
        return false;
      }
      return true;
    })
  );
};


