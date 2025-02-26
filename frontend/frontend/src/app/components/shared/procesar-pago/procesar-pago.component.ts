import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService, ReservaDTO } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-procesar-pago',
  templateUrl: './procesar-pago.component.html',
  styleUrl: './procesar-pago.component.css'
})
export class ProcesarPagoComponent {
  @Input() esAsociacion: boolean = false; // Nuevo: Saber si es para asociación

  date!: string;
  court!: string;
  price!: number;
  senia!: string;
  horario_inicio_ocupado!: string;
  horario_fin_ocupado!: string;
  cantidad_paletas: number = 0;
  cantidad_pelotas: number = 0;
  paymentId!: number;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private toastrService: ToastrService) {}

  ngOnInit() {

    this.route.queryParams.subscribe((params) => {
      this.esAsociacion = params['asociacion'] === 'true';
      this.paymentId = params['payment_id'];
      this.date = params['date'];
      this.court = params['court'];
      this.price = params['price'];
      this.senia = params['senia'];
      this.cantidad_pelotas = params['cantidad_pelotas'];
      this.cantidad_paletas = params['cantidad_paletas'];
      this.horario_inicio_ocupado = params['horario_inicio_ocupado'];
      this.horario_fin_ocupado = params['horario_fin_ocupado'];
  
      // Realizamos un console.log de todos los parámetros
      console.log('Parametros obtenidos de la URL:');
      console.log('Es asociar: ', this.esAsociacion);
      console.log('payment_id:', this.paymentId);
      console.log('fecha:', this.date);
      console.log('id_cancha:', this.court);
      console.log('precio:', this.price);
      console.log('senia:', this.senia);
      console.log('horario_inicio_ocupado:', this.horario_inicio_ocupado);
      console.log('horario_fin_ocupado:', this.horario_fin_ocupado);
    });

    // Llamar a la función después de 10 segundos (10000 milisegundos)
    setTimeout(() => {
      this.procesarPago();
    }, 10000);
  }  

  procesarPago() {
    if(this.esAsociacion){
      this.api.asociarse(this.paymentId).subscribe({
        next: (response) => {
          console.log('Asociación exitosa:', response.message);  // El mensaje estará dentro del objeto JSON
          this.router.navigate(["/home"]);
        },
        error: (error) => {
          console.error('Error al asociarse:', error);
        }
      });
    }else{
      // Determinamos el valor de 'senia' basado en el valor de 'this.senia'
      const seniaValue = this.senia === "seña" ? true : false;
      this.senia === "total" ? false : 
      (() => { throw new Error('Valor de senia no válido'); })();

      const reservaDTO: ReservaDTO = {
        cantidad_pelotas: 0,
        cantidad_paletas: 0,
        fecha: this.date, // Formato ISO-8601: 'yyyy-MM-dd'
        horario_inicio: this.horario_inicio_ocupado,  // Formato ISO-8601: 'HH:mm:ss'
        horario_fin: this.horario_fin_ocupado, // Formato ISO-8601: 'HH:mm:ss'
        numero_cancha: Number(this.court),
        id_reservador: null,
        senia: seniaValue,  // Asignamos el valor de 'senia' basado en la condición
        id_mp: this.paymentId,
      };
    
      this.api.hacerReserva(reservaDTO).subscribe({
        next: (response) => {
          // Si la respuesta es exitosa, redirige a la página de ticket
          console.log('Respuesta de la API:', response); // Verifica que la respuesta sea correcta
          this.router.navigate(['/home']);
          this.toastrService.success('Se reservo el turno con exito.', 'Reserva');
        },
        error: (err) => {
          // Si ocurre algún error en el bloqueo, muestra un mensaje de error
          console.error('Error al procesar pago', err);
          this.toastrService.error('Hubo un error al procesar el pago.', 'Error');
        }
      });
    }
  }  
}