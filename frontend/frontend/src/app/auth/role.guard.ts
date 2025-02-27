import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../api.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router = inject(Router);
  const api = inject(ApiService)

  // Obtener el rol desde localStorage
  const storedRole = api.getRolFromStorage();

  if (!storedRole) {
    console.warn("Acceso denegado: No se encontró un rol válido en el almacenamiento.");
    router.navigate(['/home']);
    return false;
  }
  
  const requiredRole = route.data['role']; 

  if (!requiredRole || storedRole === requiredRole) {
        return true; 
  }
  
  console.warn("Acceso denegado: No tienes permisos.");
  router.navigate(['/home']); // Redirigir si no tiene permisos
  return false;
};
