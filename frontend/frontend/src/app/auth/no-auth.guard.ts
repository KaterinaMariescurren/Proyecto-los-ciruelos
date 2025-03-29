import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../api.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);
  const router = inject(Router);

  return authService.getUsuario().pipe(
    switchMap(user => {
      if (user?.email) {
        return apiService.verificarUsuario(user.email).pipe(
          map(response => {
            if (response.registrado) {
              router.navigate(['/home']); // Si está registrado, redirigir a Home
              return false;
            } else {
              return true;
            }
          }),
          catchError(error => {
            console.error("Error al verificar usuario:", error);
            return of(false);
          })
        );
      } else {
        return of(true); // Si no hay usuario, permitir el acceso
      }
    })
  );
};

