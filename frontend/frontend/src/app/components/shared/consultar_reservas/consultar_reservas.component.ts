import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

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

  canchas: string[] = ["1", "2", "3", "4"];
  estados: string[] = [ "Pagada", "Cancelada", "Expirado", "Señado"];
  horarios: string[] = this.generarHorarios();
  horariosFiltrados: string[] = [...this.horarios];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private toastrService: ToastrService
  ) { }


  ngOnInit(): void {
    this.obtenerReservas();
  }

  generarHorarios(): string[] {
    let horarios = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        let hora = h.toString().padStart(2, '0');
        let minutos = m.toString().padStart(2, '0');
        horarios.push(`${hora}:${minutos}`);
      }
    }
    return horarios;
  }

  filtrarHorarios(): void {
    const input = this.filtro.horarioInicio.toLowerCase();
    this.horariosFiltrados = this.horarios.filter(h => h.includes(input));
  }

  /**
   * Obtiene todas las reservas del usuario y las almacena en `reservas` y `reservasFiltradas`
   */
  obtenerReservas(): void {
    this.apiService.getTodasReservas().subscribe((reservas) => {
      this.reservas = reservas;
      this.reservasFiltradas = [...this.reservas]; // Inicializar copia para filtros
      this.cdRef.detectChanges(); // Forzar actualización de la vista
      console.log("Reservas obtenidas:", reservas);
    });
  }

  /**
   * Cancela una reserva y recarga la lista
   */
  cancelarReserva(reserva_id: number): void {
    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      return;
    }
  
    console.log("Cancelando reserva:", reserva_id);
  
    this.apiService.cancelarReserva(reserva_id).subscribe({
      next: () => {
        this.toastrService.success("Reserva cancelada correctamente", "Éxito");
        this.obtenerReservas(); // Recargar la lista después de cancelar
      },
      error: (error) => {
        console.error("Error al cancelar la reserva:", error);
        this.toastrService.error("No se pudo cancelar la reserva", "Error");
      }
    });
  }
  
  
  /**
   * Filtra las reservas según los valores ingresados
   */
  filtrarReservas(): void {
    this.reservasFiltradas = this.reservas.filter(reserva => {
      if (!reserva || !reserva.turno || !reserva.jugador) return false;

      const coincideBusqueda = !this.busqueda ||
        reserva.jugador.email.toLowerCase().startsWith(this.busqueda.toLowerCase()) ||
        (reserva.jugador.nombre && reserva.jugador.nombre.toLowerCase().startsWith(this.busqueda.toLowerCase()));

        const fechaFiltro = this.filtro.fecha 
        ? new Date(this.filtro.fecha).toISOString().split('T')[0] 
        : null;

        const coincideFecha = !fechaFiltro || reserva.turno.fecha === fechaFiltro;

      const coincideCancha = !this.filtro.cancha ||
        reserva.turno.cancha.numero.toString() === this.filtro.cancha;
        
      const coincideEstado = !this.filtro.estado || reserva.estado === this.filtro.estado;

      const coincideHorario = !this.filtro.horarioInicio || reserva.turno.horarioInicio.startsWith(this.filtro.horarioInicio);

      return coincideBusqueda && coincideFecha && coincideCancha && coincideEstado && coincideHorario;
    });
  }

  limpiarHorario(): void {
    this.filtro.horarioInicio = ''; // Limpiar el filtro
    this.filtrarReservas(); // Aplicar el filtro sin restricciones de horario
  }
  

}
