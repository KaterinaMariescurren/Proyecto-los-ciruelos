import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { Observable, switchMap, throwError } from 'rxjs';

export interface Reserva {
  id_cancha: number;
  fecha: string;
  horario_inicio_ocupado: string;  // Hora de inicio
  horario_fin_ocupado: string;    // Hora de finalización
}

export interface TurnoDTO {
  id_cancha: number;
  fecha: string;
  horario_inicio_ocupado: string;
  horario_fin_ocupado: string;
}

export interface ReservaDTO {
  cantidad_pelotas: number;
  cantidad_paletas: number;
  fecha: string;  // Formato ISO-8601: 'yyyy-MM-dd'
  horario_inicio: string;  // Formato ISO-8601: 'HH:mm:ss'
  horario_fin: string;  // Formato ISO-8601: 'HH:mm:ss'
  numero_cancha: number;
  id_reservador: number | null;
  senia: boolean;
  id_mp: number;
}

export interface Telefono {
  codigo: number;
  numero: number;
}

export interface JugadorDTO {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  categoria: string;
  socio: boolean;
  profesor: boolean;
  telefonos: {
    codigo: number;
    numero: number;
  }[];
}

export interface UsuarioDTO {
  email: string;
  nombre: string;
  apellido: string;
  telefonos: Telefono[];
  categoria: string;
}

export interface EmpleadoDTO {
  email: string;
  nombre: string;
  apellido: string;
  telefonos: Telefono[];
  duenio: boolean;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/'; // Reemplaza con tu URL de backend

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPerfil(): Observable<any> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/consultar_perfil?email=${encodeURIComponent(email)}`;
        return this.http.get<any>(url);
      })
    );
  }

  getProfesores(email?: string, nombre?: string, apellido?: string): Observable<any[]> {
    let url = `${this.apiUrl}public/consultar/usuarios/buscar_profesor?`;
    const params = [];

    if (email) params.push(`email=${email}`);
    if (nombre) params.push(`nombre=${nombre}`);
    if (apellido) params.push(`apellido=${apellido}`);

    url += params.join("&");

    return this.http.get<any[]>(url , { responseType: 'json' });
  }

  getResrvas(): Observable<any[]> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/consultar/reservas?email=${encodeURIComponent(email)}`;
        return this.http.get<any[]>(url);
      })
    );
  }

  cancelarReserva(reserva_id: number): Observable<string> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }

        // Objeto con los datos a enviar en el cuerpo
        const requestBody = {
          email: encodeURIComponent(email),
          reservaId: reserva_id
        };

        const url = `${this.apiUrl}public/cancelar/reserva`;
        return this.http.put<string>(url, requestBody);
      })
    );
  }
  
  getTurnos(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl+"public/consultar_turnos")
  }

  bloquearTurno(turnoDTO: TurnoDTO): Observable<any> {
    // Realizar la solicitud PUT a la API con el token en los headers y el cuerpo en turnoDTO
    return this.http.put<string>(this.apiUrl + 'public/bloquear/turno', turnoDTO);
  }  

  hacerReserva(reservaDTO: ReservaDTO): Observable<any> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/reservas/reservar_turno?email=${encodeURIComponent(email)}`;
        return this.http.post<any>(url, reservaDTO);
      })
    );
  }

  registrarUsuario(jugadorDTO: JugadorDTO): Observable<any> {
    const url = `${this.apiUrl}public/registro/jugador`;
      return this.http.post<any>(url, jugadorDTO);
    }

    registrarEmpleado(emailUsuario: string, empleadoDTO: EmpleadoDTO): Observable<any> {
      const url = `${this.apiUrl}public/registro/empleado?email=${encodeURIComponent(emailUsuario)}`;
      return this.http.post<any>(url, empleadoDTO);
    }

  asociarse(id_mp: number): Observable<any> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/asociarse?email=${email}&id_mp=${id_mp}`;
        return this.http.put<any>(url, null); // Se usa null porque los datos van en la URL, no en el cuerpo
      }));
  }
  
  getUsuarios(): Observable<UsuarioDTO[]> {
    return this.authService.getUserRole().pipe(
      switchMap(role => {
        if (role !== 'admin') {
          console.error("Acceso denegado: Solo el administrador puede ver los usuarios.");
          return throwError(() => new Error("No autorizado"));
        }

        const url = `${this.apiUrl}private/usuarios`; 
        return this.http.get<UsuarioDTO[]>(url);
      })
    );
  }
  

  eliminarUsuario(usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}public/eliminar/usuario/${usuarioId}`;
    return this.http.delete<any>(url);
  }
  
  updateConfiguracion(nuevaConfiguracion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}public/configuracion/actualizar`, nuevaConfiguracion);
  }

  getRol(): Observable<{ message: string }> { 
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/verificar/empleado?email=${email}`;
        return this.http.get<{ message: string }>(url); 
      })
    );
  }

  setRolInStorage(rol: string) {
    localStorage.setItem('userRole', rol); // O sessionStorage si prefieres
  }

  getRolFromStorage(): string | null {
    return localStorage.getItem('userRole');
  }
}
