import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUserRole().pipe(
    map((role) => {
      const requiredRole = route.data['role']; // Obtiene el rol requerido en la ruta

      if (!requiredRole || role === requiredRole) {
        return true; // Permite el acceso
      }

      console.warn("Acceso denegado: No tienes permisos.");
      router.navigate(['/home']); // Redirigir si no tiene permisos
      return false;
    })
  );
};
