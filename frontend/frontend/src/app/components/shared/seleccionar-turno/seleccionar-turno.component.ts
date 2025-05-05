import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService, Cancha, Reserva, TurnoDTO } from '../../../api.service';
import { Observable } from 'rxjs';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

interface Turno {
  cancha: string;
  horaInicio: string;
  horaFin: string;
  fecha: string;
}

@Component({
  selector: 'app-seleccionar-turno',
  templateUrl: './seleccionar-turno.component.html',
  styleUrl: './seleccionar-turno.component.css'
})
export class SeleccionarTurnoComponent implements OnInit {
  form!: FormGroup;
  hoy = new Date();  // Esto va en el componente
  horarios: string[] = [];

  // Simulación de canchas con horarios disponibles
  canchas : Cancha[] = [];

  horaInicioSeleccionado: string = '';
  horarioFinCalculado: string = '';
  fechaSeleccionada: string = '';
  duracionSeleccionada: number = 0;
  precioTurno: number = 0;
  busquedaRealizada: boolean = false;

  isLoggedIn$!: Observable<boolean>;
  isSocio: boolean = false;
  isRegistrado: boolean = false;

  configuracion: ConfiguracionGeneral | null = null;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,  
    private configuracionService: ConfiguracionService,
    private authService: AuthService, 
    private toastrService: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fecha: [null, Validators.required],
      horaInicio: ['', Validators.required],
      duracion: [90, Validators.required]
    });

    for (let h = 6; h <= 22; h++) { // ejemplo: de 06:00 a 22:30
      this.horarios.push(`${this.formatoHora(h)}:00`);
      this.horarios.push(`${this.formatoHora(h)}:30`);
    }

    if (!this.configuracion) {
      this.configuracionService.getConfiguracion().subscribe(config => {
        // Guardamos la configuración para poder usarla más tarde
        this.configuracionService.setConfiguracion(config);
        this.configuracion = config;
      });
    }
    this.isLoggedIn$ = this.authService.isAuthenticated$();
    this.isLoggedIn$.subscribe(isLogged => {
      if (isLogged) {
        this.api.getPerfil().subscribe((perfil) => {
          if (perfil?.socio !== undefined) {
            this.isSocio = perfil.socio;
            this.isRegistrado = true;
          } else {
            this.isRegistrado = false;
          }
        });
      }
    });
  }

  cargarCanchas(fecha: string, horarioInicio: string, duracion: number) {
    const turnoDTO: TurnoDTO = {
      id_cancha: 0,
      fechaDeseada: fecha,
      horario_deseado: horarioInicio,
      duracion: duracion
    }
    this.api.getCanchas(turnoDTO).subscribe(
      (canchas) => {
        this.canchas = canchas;
        console.log(this.canchas)
      },
      (error) => {
        console.error('Error al cargar los turnos', error);
      }
    );
  }

  formatoHora(hora: number): string {
    return hora < 10 ? `0${hora}` : `${hora}`;
  }

  verTurnosDisponibles(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { fecha, horaInicio, duracion } = this.form.value;

    this.fechaSeleccionada = fecha;
    this.horaInicioSeleccionado = horaInicio;
    this.horarioFinCalculado = this.calcularHoraFin(horaInicio, duracion);
    this.duracionSeleccionada = duracion;
    this.precioTurno = this.configuracion?.monto_reserva ?? 0;

    this.busquedaRealizada = true; // ← Agregado

    this.cargarCanchas(fecha, horaInicio, duracion);
  }

  seleccionarTurno(turno: Cancha): void {
    console.log('Turno seleccionado:', turno);
    // Podés emitir un EventEmitter, navegar o guardar este turno
  }

  calcularHoraFin(horaInicio: string, duracion: number): string {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + duracion;
    const horasFin = Math.floor(totalMinutos / 60);
    const minutosFin = totalMinutos % 60;
  
    // Asegura formato HH:MM
    const hh = horasFin.toString().padStart(2, '0');
    const mm = minutosFin.toString().padStart(2, '0');
  
    return `${hh}:${mm}`;
  }  

  onButtonClick(cancha_id: number) {
    this.authService.isAuthenticated$().subscribe((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/login']);
        return;
      }
      if (!this.isRegistrado) {
        this.toastrService.info('Debes completar tus datos antes de continuar.', 'Completar Datos');
        this.router.navigate(['/postregister']);
        return;
      }

      const selectedDate = this.fechaSeleccionada; // Fecha seleccionada en el calendario
      const startTime = this.horaInicioSeleccionado ?? ""; // El horario de inicio es el slot donde el usuario hace click

      const turnoDTO: TurnoDTO = {
        id_cancha: cancha_id, 
        fechaDeseada: selectedDate, 
        horario_deseado: startTime ?? "", 
        duracion: this.duracionSeleccionada 
      };

      // Bloquear el turno a través de la API
      this.api.bloquearTurno(turnoDTO).subscribe({
        next: (response) => {
          // Si la respuesta es exitosa, redirige a la página de ticket
          if (response?.message === "Se bloqueo el turno") {

            this.router.navigate(['/reserva'], {
              queryParams: {
                id_cancha: turnoDTO.id_cancha,
                fecha: turnoDTO.fechaDeseada,
                horario_inicio_ocupado: turnoDTO.horario_deseado,
                horario_fin_ocupado: this.calcularHoraFin(this.horaInicioSeleccionado, this.duracionSeleccionada)
              }
            });
          }
        },
        error: (err) => {
          // Si ocurre algún error en el bloqueo, muestra un mensaje de error
          console.error('Error al bloquear el turno', err);
          this.toastrService.error('Hubo un error al intentar bloquear el turno.', 'Error');
        }
      });
    })
  }  
}