import { Component } from '@angular/core';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'consultar_reservas',
  templateUrl: './consultar_reservas.component.html',
  styleUrls: ['./consultar_reservas.component.css']
})
export class ConsultarReservasComponent {
  usuarioActual: any;
  reservas: any[] = [];
  reservasFiltradas: any[] = [];
  busqueda: string = '';


  filtro = {
    fecha: '',
    cancha: '',
    estado: '',
    horarioInicio: '', 
  };

  canchas: string[] = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"];
  estados: string[] = ["Pendiente", "Confirmada", "Cancelada", "Expirada"];
  horarios: string[] = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];

  constructor(
    private authService: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.obtenerReservas();
  }

  obtenerReservas(): void {
    this.api.getResrvas().subscribe((reservas) => {
      this.reservas = reservas;
      console.log(reservas);
      this.reservasFiltradas = reservas; 
    });
  }

  cancelarReserva(reserva_id: number): void {
    console.log(reserva_id);
    this.api.cancelarReserva(reserva_id).subscribe((cancelacion) => {
      console.log(cancelacion);
      this.obtenerReservas();
    });
  }

  filtrarReservas(): void {
    this.reservasFiltradas = this.reservas.filter(reserva => {
      if (!reserva || !reserva.turno) return false;

      return (
        (!this.filtro.fecha || reserva.turno.fecha === this.filtro.fecha) &&
        (!this.filtro.cancha || reserva.turno.cancha === this.filtro.cancha) &&
        (!this.filtro.estado || reserva.estado === this.filtro.estado) &&
        (!this.filtro.horarioInicio || reserva.turno.horarioInicio === this.filtro.horarioInicio)
      );
    });
  }

  seleccionarCancha(cancha: string): void {
    this.filtro.cancha = this.filtro.cancha === cancha ? '' : cancha;
    this.filtrarReservas();
  }

  seleccionarEstado(estado: string): void {
    this.filtro.estado = this.filtro.estado === estado ? '' : estado;
    this.filtrarReservas();
  }

  seleccionarHorario(horario: string): void {
    this.filtro.horarioInicio = this.filtro.horarioInicio === horario ? '' : horario;
    this.filtrarReservas();
  }
}
