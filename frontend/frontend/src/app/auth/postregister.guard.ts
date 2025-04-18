import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ApiService } from '../api.service';
import { AuthService } from '../services/auth.service';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const postRegisterGuard: CanActivateFn = (route, state) => {
  const apiService = inject(ApiService);
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastrService = inject(ToastrService);
  

  return authService.getCurrentUser$().pipe( // Asumimos que devuelve observable del usuario logueado
    switchMap(user => {
      if (!user?.email) {
        return of(true); // Si no hay usuario, no aplica este guard
      }

      return apiService.verificarUsuario(user.email).pipe(
        map(response => {
          if (response.registrado) {
            return true; // Usuario ya está registrado, puede navegar
          } else if (state.url === '/postregister') {
            return true; // Está en postregister, se permite
          } else {
            // Si no está registrado y quiere navegar a otra página => redirigir
            toastrService.info('Debe completar sus datos para seguir.', 'Completar Datos');
            return router.parseUrl('/postregister');
          }
        }),
        catchError(err => {
          console.error('Error en postregister guard:', err);
          return of(router.parseUrl('/postregister'));
        })
      );
    }),
    catchError(() => of(router.parseUrl('/postregister')))
  );
};
