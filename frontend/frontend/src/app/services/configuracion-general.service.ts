import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DiaApertura {
  id: number;
  dia: string;
  horario_inicio: string;
  horario_fin: string;
}

export interface ConfiguracionGeneral {
  id: number;
  monto_reserva: number;
  monto_asociacion: number;
  porcentaje_senia: number;
  descuento_socio: number;
  monto_paletas: number;
  monto_pelotas: number;
  stock_pelotas: number;
  stock_paletas: number;
  duracion_minima_turno: number;
  duracion_maxima_turno: number;
  horario_inicio_pico: string;
  horario_fin_pico: string;
  monto_x_media_hora: number;
  dias_apertura: DiaApertura[];
}

@Injectable({
  providedIn: 'root'  // Esto hace que el servicio sea singleton (disponible en toda la app)
})
export class ConfiguracionService {
  private apiUrl = 'http://localhost:8080/'; // URL del API
  private configuracion: ConfiguracionGeneral | null = null;  // Aquí se almacenará la configuración

  constructor(private http: HttpClient) {}

  // Método para obtener la configuración desde el backend
  getConfiguracion(): Observable<ConfiguracionGeneral> {
    return this.http.get<ConfiguracionGeneral>(`${this.apiUrl}configuracion_general/public/consultar_configuracion`);
  }

  // Método para guardar la configuración en el servicio
  setConfiguracion(config: ConfiguracionGeneral): void {
    this.configuracion = config;
  }

  // Método para obtener la configuración desde el servicio
  getStoredConfiguracion(): ConfiguracionGeneral | null {
    return this.configuracion;
  }
}
