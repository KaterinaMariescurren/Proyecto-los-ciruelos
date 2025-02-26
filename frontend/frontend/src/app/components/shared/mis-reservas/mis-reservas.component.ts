import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent {
  usuarioActual: any;
  reservas: any[] = []; 
  reservasFiltradas: any[] = [];

  filtro = {
    fecha: '',
    cancha: ''
  };

  canchas: string[] = ["Cancha 1", "Cancha 2", "Cancha 3", "Cancha 4"]; 

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef // Importar ChangeDetectorRef
  ) {}

  ngOnInit(): void {

      this.obtenerReservas();
  }

  obtenerReservas(): void {
    this.api.getResrvas().subscribe((reservas) => {
      this.reservas = reservas;
      this.cdr.detectChanges(); // Forzar la actualización de la vista
      console.log(reservas)
    });
  }

  cancelarReserva(reserva_id:number): void {
    console.log(reserva_id);
    this.api.cancelarReserva(reserva_id).subscribe((cancelacion) => {
      console.log(cancelacion);
      this.obtenerReservas();
    });
  }

  esReservaCanceladaOExpirada(reserva: any): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar la fecha de hoy sin horas

    const partesFecha = reserva.turno.fecha.split('-'); // Asegurar formato correcto
    const fechaReserva = new Date(
        parseInt(partesFecha[0], 10),  // Año
        parseInt(partesFecha[1], 10) - 1, // Mes (0-indexed)
        parseInt(partesFecha[2], 10) // Día
    );

    return reserva.estado === 'Cancelada' || fechaReserva < hoy;
  }

  getPrecioTotal(pagos: any[]): number {
    return pagos.reduce((total, pago) => total + pago.monto, 0);
  }  

  filtrarReservas(): void {
    this.reservasFiltradas = this.reservas.filter(reserva => {
      return (
        (!this.filtro.fecha || reserva.fecha === this.filtro.fecha) &&
        (!this.filtro.cancha || reserva.cancha === this.filtro.cancha)
      );
    });
  }

  seleccionarCancha(cancha: string): void {
    this.filtro.cancha = this.filtro.cancha === cancha ? '' : cancha;
    this.filtrarReservas();
  }
  
}
