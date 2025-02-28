import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent {
  rol: string | null = null;
  form!: FormGroup;
  errorMessages: string[] = [];
  pago: 'seña' | 'total' = 'seña'; // Estado del pago
  precio: number = 0;
  precioPelota = 500;
  precioPaleta = 1500;

  jugadorSeleccionado: any = null;
  usuariosFiltrados: any[] = [];

  date!: string;
  court!: string;
  senia!: string;
  horario_inicio_ocupado!: string;
  horario_fin_ocupado!: string;

  isSocio: boolean = false;

  configuracion: ConfiguracionGeneral | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private api: ApiService,
    private toastrService: ToastrService,
    private configuracionService: ConfiguracionService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.api.getPerfil().subscribe((perfil) => {
      console.log(perfil.socio);
      this.isSocio = perfil?.socio ?? false; // Si el campo "socio" es true, se guarda en isSocio

    });
  }

  ngOnInit(): void {
    this.api.getRol().subscribe({
      next: (data: any) => {
        this.rol = data.message;
        this.obtenerUsuarios();
        console.log("Rol obtenido:", this.rol);
  
        // Ahora que tenemos el rol, actualizamos la validación de jugadorSeleccionado si es necesario
        if (this.rol === 'duenio' || this.rol === 'empleado') {
          this.form.get('jugadorSeleccionado')?.setValidators([Validators.required]);
          this.form.get('jugadorSeleccionado')?.updateValueAndValidity();
        }
  
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.rol = 'none';
        console.error("Error al obtener el rol:", err);
      }
    });
  
    // Inicialización del formulario sin validación en jugadorSeleccionado
    this.form = this.formBuilder.group({
      pelotas: [0, [Validators.required, Validators.min(0)]],
      paletas: [0, [Validators.required, Validators.min(0)]],
      jugadorSeleccionado: [null] // La validación se agregará después si es necesario
    });

    this.obtenerConfiguracion();
  
    // Escuchar cambios en el formulario para actualizar el precio
    this.form.valueChanges.subscribe(() => {
      this.calcularPrecio();
    });
  
    this.route.queryParams.subscribe(params => {
      this.date = params['fecha'];
      this.court = params['id_cancha'];
      this.horario_inicio_ocupado = params['horario_inicio_ocupado'];
      this.horario_fin_ocupado = params['horario_fin_ocupado'];
    });
  }
  

  obtenerUsuarios(): void {
    if (this.rol === 'duenio' || this.rol === 'empleado') {
      this.api.getUsuarios().subscribe({
        next: (usuarios) => {
          console.log("Usuarios obtenidos del backend:", usuarios);

          // Filtrar solo los jugadores (sin rol de dueño)
          this.usuariosFiltrados = usuarios.filter(usuario => !('duenio' in usuario) && !('empleado' in usuario));
          console.log("Usuarios filtrados (solo jugadores):", this.usuariosFiltrados);
        },
        error: (err) => {
          console.error("Error al obtener usuarios:", err);
        }
      });
    }
  }

  // Agregar un método que permita seleccionar un jugador
  seleccionarJugador(): void {
    this.calcularPrecio();
  }


  obtenerConfiguracion(): void {
    // Primero revisamos si ya tenemos la configuración almacenada
    this.configuracion = this.configuracionService.getStoredConfiguracion();

    if (!this.configuracion) {
      this.configuracionService.getConfiguracion().subscribe(config => {
        this.configuracionService.setConfiguracion(config);
        this.configuracion = config;
        this.precioPaleta = this.configuracion.monto_paletas;
        this.precioPelota = this.configuracion.monto_pelotas;

        // Ahora que tenemos la configuración, calculamos el precio inicial
        this.calcularPrecio();
      });
    } else {
      this.calcularPrecio();
    }
  }

  setPago(opcion: 'seña' | 'total'): void {
    this.pago = opcion;
    this.calcularPrecio();
  }

  calcularPrecio(): void {
    if (this.configuracion) {
      const pelotas = this.form.get('pelotas')?.value || 0;
      const paletas = this.form.get('paletas')?.value || 0;
      const jugadorSeleccionado = this.form.get('jugadorSeleccionado')?.value;
      let precioBase = (pelotas * this.precioPelota) + (paletas * this.precioPaleta) + this.configuracion?.monto_reserva;

      if (this.rol === 'duenio' || this.rol === 'empleado') {
        this.precio = precioBase;
        if (this.jugadorSeleccionado && this.jugadorSeleccionado.socio) {

        }

      } else {
        if (this.pago === "seña") {
          this.precio = precioBase * this.configuracion.porcentaje_seña;
        } else {
          this.precio = precioBase;
        }
      }

      if (this.isSocio || (jugadorSeleccionado && jugadorSeleccionado.socio)) {
        this.precio -= this.configuracion.monto_reserva * this.configuracion.descuento_socio;
      }

      this.precio = Math.max(this.precio, 0);
    }
  }

  async next() {
    if (this.form.invalid) {
      this.toastrService.error('Por favor, complete los campos correctamente.');
      return;
    }

    const formValues = this.form.value;
    console.log("Pelotas:", formValues.pelotas);
    console.log("Paletas:", formValues.paletas);
    console.log("Precio total:", this.precio);

    if (this.rol === 'duenio' || this.rol === 'empleado') {
      this.jugadorSeleccionado = this.form.get('jugadorSeleccionado')?.value;
      this.pago = "total";
      console.log("Pago:", this.pago);
      console.log("Jugador seleccionado:", this.jugadorSeleccionado.email);
    }

    this.router.navigate(['/ticket'], {
      queryParams: {
        id_cancha: this.court,
        fecha: this.date,
        horario_inicio_ocupado: this.horario_inicio_ocupado,
        horario_fin_ocupado: this.horario_fin_ocupado,
        cantidad_paletas: formValues.paletas,
        cantidad_pelotas: formValues.pelotas,
        precio: this.precio,
        senia: this.pago,
        jugador: JSON.stringify(this.jugadorSeleccionado)
      }
    });
  }

}