// src/app/services/mercadopago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { ApiService } from '../api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MercadopagoService {
  constructor(private http: HttpClient, private api: ApiService, private authService: AuthService) {}

  createPreference(data: {
    title: string;
    price: number;
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
  }): Observable<{ preferenceId: string }> {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        if (!token) {
          console.error("❌ No se encontró un token válido.");
          return throwError(() => new Error("Token no disponible"));
        }
  
        const url = `http://localhost:8080/private/mercadopago/preference`;
  
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
  
        return this.http.post<{ preferenceId: string }>(url, data, { headers });
      })
    );
  }
  
}
