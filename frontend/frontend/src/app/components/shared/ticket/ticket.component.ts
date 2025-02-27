import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { MercadopagoService } from '../../../services/mercadopago.service';
import { AuthService } from '../../../services/auth.service';
import { ApiService, ReservaDTO } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent {
  @Input() esAsociacion: boolean = false; // Nuevo: Saber si es para asociación

  date!: string;
  court?: string;
  price!: number;
  cantidad_paletas: number = 0;
  cantidad_pelotas: number = 0;
  senia: string = "";
  jugador?: any
  horario_inicio_ocupado: string = "";
  horario_fin_ocupado: string = "";
  informacion!: string;
  rol: string | null = null;

  configuracion: ConfiguracionGeneral | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configuracionService: ConfiguracionService,
    private mercadopagoService: MercadopagoService,
    private authService: AuthService,
    private api: ApiService,  
    private cdRef: ChangeDetectorRef,
    private toastrService: ToastrService
    
  ) { }

  ngOnInit(): void {
    this.api.getRol().subscribe({
      next: (data: any) => {
        this.rol = data.message; 
        console.log("Rol obtenido:", this.rol); // <-- Agrega este log
        this.cdRef.detectChanges();

      },
      error: (err) => {
        this.rol = 'none';
        console.error("Error al obtener el rol:", err);
      }
    });

    this.configuracion = this.configuracionService.getStoredConfiguracion();

    // Si no la tenemos, la obtenemos del backend
    if (!this.configuracion) {
      this.configuracionService.getConfiguracion().subscribe(config => {
        // Guardamos la configuración para poder usarla más tarde
        this.configuracionService.setConfiguracion(config);
        this.configuracion = config;
        this.price = config.monto_asociacion;
      });
    }

    this.route.queryParams.subscribe(params => {
      // Si el query param `asociacion` es `true`, activamos el modo asociación
      this.esAsociacion = params['asociacion'] === 'true';


      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1);

      const opciones = { day: '2-digit', month: '2-digit', year: 'numeric' } as const;
      const fechaInicioStr = fechaInicio.toLocaleDateString('es-AR', opciones);
      const fechaFinStr = fechaFin.toLocaleDateString('es-AR', opciones);
      this.date = `${fechaInicioStr} `;
      this.informacion = `Usted está asociado desde el ${fechaInicioStr} hasta el ${fechaFinStr}.`;

      if (!this.esAsociacion) {
        this.date = params['fecha'];
        this.cantidad_pelotas = params['cantidad_pelotas'];
        this.cantidad_paletas = params['cantidad_paletas'];
        this.court = params['id_cancha'];
        this.senia = params['senia'];
        this.price = params['precio'];
        this.horario_inicio_ocupado = params['horario_inicio_ocupado'];
        this.horario_fin_ocupado = params['horario_fin_ocupado'];
        this.informacion = 'Detalles sobre la cancha';
        this.jugador = JSON.parse(params['jugador']); 
        console.log(this.jugador);
      }

      // Verificar si el usuario está autenticado antes de proceder con el pago
      if (!this.authService.isAuthenticated()) {
        // Si el usuario no está autenticado, redirigirlo al login
        this.router.navigate(['/login']);
      } else {
        // Si está autenticado, proceder con la creación de la preferencia
        this.redirectToMercadoPago();
      }
    });

    // Verificar si el usuario está autenticado antes de proceder con el pago
    if (!this.authService.isAuthenticated()) {
      // Si el usuario no está autenticado, redirigirlo al login
      this.router.navigate(['/login']);
    } else {
      // Si está autenticado, proceder con la creación de la preferencia
      this.redirectToMercadoPago();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Función para redirigir al usuario a Mercado Pago
  redirectToMercadoPago() {
    if (this.esAsociacion) {
      if (this.configuracion) {
        const preference = {
          items: [
            {
              title: 'Asociación - Los Ciruelos Padel Club',
              quantity: 1,
              unit_price:parseFloat(this.configuracion.monto_asociacion.toString()),
              currency_id: 'ARS',
            }
          ],
          back_urls: {
            success: `http://localhost:4200/procesar-pago?asociacion=true`,
            failure: 'http://localhost:4200/ticket',
            pending: 'http://localhost:4200/ticket'
          },
          auto_return: 'approved',
        };
  
        this.mercadopagoService.createPreference(preference).subscribe(response => {
          this.loadMercadoPago(response.id);
        }, error => {
          console.error('Error creando la preferencia:', error);
        });
      }

    } else {
      const preference = {
        items: [
          {
            title: 'Reserva cancha - Los Ciruelos Padel Club',
            quantity: 1,
            unit_price: parseFloat(this.price.toString()),
            currency_id: 'ARS',
          }
        ],
        back_urls: {
          success: `http://localhost:4200/procesar-pago?date=${this.date}&horario_inicio_ocupado=${this.horario_inicio_ocupado}&court=${this.court}&price=${this.price}&senia=${this.senia}&horario_fin_ocupado=${this.horario_fin_ocupado}`,
          failure: 'http://localhost:4200/ticket',
          pending: 'http://localhost:4200/ticket'
        },
        auto_return: 'approved',
      };

      this.mercadopagoService.createPreference(preference).subscribe(response => {
        this.loadMercadoPago(response.id);
      }, error => {
        console.error('Error creando la preferencia:', error);
      });
    }

  }

  loadMercadoPago(preferenceId: string) {
    const mp = new (window as any).MercadoPago('APP_USR-762225fb-73cd-4033-b1ad-4b16b6f579da', {
      locale: 'es-AR'
    });

    const bricksBuilder = mp.bricks();
    bricksBuilder.create('wallet', 'wallet_container', {
      initialization: { preferenceId: preferenceId, redirectMode: 'modal' },
      customization: {
        texts: {
          action: 'buy',
          valueProp: 'security_details'
        }
      },
    });
  }

  reservar(): void {
    const seniaValue = this.senia === "seña" ? true : false;
    this.senia === "total" ? false : 
    (() => { throw new Error('Valor de senia no válido'); })();
    if (this.rol === "duenio"){
      const reservaDTO: ReservaDTO = {
        cantidad_pelotas: this.cantidad_paletas,
        cantidad_paletas: this.cantidad_pelotas,
        fecha: this.date, // Formato ISO-8601: 'yyyy-MM-dd'
        horario_inicio: this.horario_inicio_ocupado,  // Formato ISO-8601: 'HH:mm:ss'
        horario_fin: this.horario_fin_ocupado, // Formato ISO-8601: 'HH:mm:ss'
        numero_cancha: Number(this.court),
        id_reservador: this.jugador.id,
        senia: seniaValue,  // Asignamos el valor de 'senia' basado en la condición
        id_mp: 0,
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
          console.error('Error al reservar el turno', err);
          this.toastrService.error('Hubo un error al reservar el turno.', 'Error');
        }
      });
    }
  }
}
