import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { catchError, from, Observable, switchMap, throwError } from 'rxjs';

export interface Reserva {
  id_cancha: number;
  fecha: string;
  horario_inicio_ocupado: string;  // Hora de inicio
  horario_fin_ocupado: string;    // Hora de finalización
}

interface VerificarUsuarioResponse {
  registrado: boolean;
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

  constructor(private http: HttpClient, private authService: AuthService) { }

  getPerfil(): Observable<any> {
    return from(this.authService.getIdToken()).pipe(  // Aquí usamos 'from' para convertir la promesa en un observable
      switchMap(token => {
        if (!token) {
          console.error("Error: No se encontró un token válido.");
          return throwError(() => new Error("No hay token de usuario"));
        }
        const url = `${this.apiUrl}private/consultar_perfil`;
        
        // Enviar la solicitud con el token en el encabezado "Authorization"
        const headers = {
          'Authorization': `Bearer ${token}` // Aquí se envía el token en el encabezado
        };
  
        return this.http.get<any>(url, { headers });
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

    return this.http.get<any[]>(url, { responseType: 'json' });
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

  getTurnos(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl + "public/consultar_turnos")
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

  registrarUsuario(jugadorDTO: JugadorDTO, password: string): Observable<any> {
    const url = `${this.apiUrl}public/registro/jugador`;
    return this.http.post<any>(url, jugadorDTO, {params: { password:password } });
  }

  verificarUsuario(email: string) {
    return this.http.get<VerificarUsuarioResponse>(`http://localhost:8080/public/usuarios/verificar-usuario/${email}`);
  }

  registrarEmpleado(password: string, empleadoDTO: EmpleadoDTO): Observable<any> {
    const url = `${this.apiUrl}private/registro/empleado`;
  
    return from(this.authService.getIdToken()).pipe( // 👈 usamos tu método ya definido
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        const params = new HttpParams().set('password', password);
  
        return this.http.post<any>(url, empleadoDTO, { headers, params });
      })
    );
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
    return this.getRol().pipe(
      switchMap(response => {
        const rol = response.message;
        console.log("🔍 Rol obtenido en getUsuarios:", rol);

        if (rol !== 'duenio' && rol !== 'empleado') {
          console.error("Acceso denegado: Solo el dueño puede ver los usuarios.");
          return throwError(() => new Error("No autorizado"));
        }

        return this.authService.getUserEmail().pipe(
          switchMap(email => {
            if (!email) {
              console.error("❌ No se encontró el email del usuario autenticado.");
              return throwError(() => new Error("Email no disponible"));
            }

            console.log("📩 Enviando email_usuario en la petición:", email);
            const url = `${this.apiUrl}public/consultar/usuarios/buscar?email_usuario=${email}`;

            return this.http.get<UsuarioDTO[]>(url);
          })
        );
      })
    );
  }

  eliminarUsuario(usuarioId: number): Observable<any> {
    const url = `${this.apiUrl}public/eliminar/usuario/${usuarioId}`;
    return this.http.delete<any>(url);
  }

  updateConfiguracion(email: string, nuevaConfiguracion: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}configuracion_general/public/actualizar_configuracion?email=${email}`, nuevaConfiguracion);
  }

  getRol(): Observable<{ message: string }> {
    const url = `${this.apiUrl}private/verificar/empleado`;
    return from(this.authService.getIdToken()).pipe( // 👈 usamos tu método ya definido
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
  
        return this.http.get<any>(url, { headers });
      })
    );
  }

  setRolInStorage(rol: string) {
    localStorage.setItem('userRole', rol); // O sessionStorage si prefieres
  }

  getRolFromStorage(): string | null {
    return localStorage.getItem('userRole');
  }

  getUsuariosFiltrados(busqueda: string, filtro: any): Observable<UsuarioDTO[]> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("❌ No se encontró el email del usuario autenticado.");
          return throwError(() => new Error("Email no disponible"));
        }

        let params: any = { email_usuario: email };

        if (busqueda) params.nombre = busqueda; // Enviamos el nombre si hay búsqueda
        if (filtro.categoria) params.categoria = filtro.categoria;
        if (filtro.socio) params.socio = filtro.socio;
        if (filtro.profesor) params.profesor = filtro.profesor;

        console.log("📩 Enviando filtros en la petición:", params);

        const url = `${this.apiUrl}public/consultar/usuarios/buscar`;
        return this.http.get<UsuarioDTO[]>(url, { params });
      })
    );
  }

  asignarRolProfesor(email: string, jugadorId: number): Observable<any> {
    const url = `${this.apiUrl}public/jugadores/asignar_profesor/${jugadorId}?email=${encodeURIComponent(email)}`;
    return this.http.put(url, {}, { responseType: 'text' });
  }

  sacarRolProfesor(email: string, jugadorId: number): Observable<any> {
    const url = `${this.apiUrl}public/jugadores/desasignar_profesor/${jugadorId}?email=${encodeURIComponent(email)}`;
    return this.http.put(url, {}, { responseType: 'text' });
  }


  asignarRolSocio(email: string, jugadorId: number): Observable<any> {
    const url = `${this.apiUrl}public/asociar_jugador?id_jugador=${jugadorId}&email=${encodeURIComponent(email)}`;
    return this.http.put(url, {}, { responseType: 'text' });
  }

  sacarRolSocio(email: string, jugadorId: number): Observable<any> {
    const url = `${this.apiUrl}public/desasociar_jugador?id_jugador=${jugadorId}&email=${encodeURIComponent(email)}`;
    return this.http.put(url, {}, { responseType: 'text' });
  }

  getTodasReservas(): Observable<any[]> {
    return this.authService.getUserEmail().pipe(
      switchMap(email => {
        if (!email) {
          console.error("Error: No se encontró un email válido.");
          return throwError(() => new Error("No hay usuario autenticado"));
        }
        const url = `${this.apiUrl}public/consultar/todas_reservas?email=${encodeURIComponent(email)}`;
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
  
        const url = `${this.apiUrl}public/cancelar/reserva?email=${encodeURIComponent(email)}&id_reserva=${reserva_id}`;
        return this.http.put(url, null, { responseType: 'text' }); // 👈 Esto evita el error de JSON
      })
    );
  }  
  
  
}
