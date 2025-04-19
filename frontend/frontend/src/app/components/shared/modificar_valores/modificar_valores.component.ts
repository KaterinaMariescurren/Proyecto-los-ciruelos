import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-modificar_valores',
  templateUrl: './modificar_valores.component.html',
  styleUrls: ['./modificar_valores.component.css']
})
export class ModificarValoresComponent implements OnInit {
  form!: FormGroup;
  formModificado: boolean = false;
  duenioEmail: string = '';
  diasApertura: any[] = [];
  originalValues: any = {};
  horasDisponibles: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private configuracionService: ConfiguracionService,
    private apiService: ApiService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.getUserEmail().subscribe((email) => {
      if (!email) {
        this.toastrService.error('No se pudo obtener el email del dueño', 'Error');
        return;
      }
      this.duenioEmail = email; 
    });

    this.form = this.formBuilder.group({
      monto_reserva: [0, [Validators.required, Validators.min(0)]],
      monto_asociacion: [0, [Validators.required, Validators.min(0)]],
      porcentaje_seña: [0, [Validators.required, Validators.min(0)]],
      descuento_socio: [0, [Validators.required, Validators.min(0)]],
      monto_paletas: [0, [Validators.required, Validators.min(0)]],
      monto_pelotas: [0, [Validators.required, Validators.min(0)]],
      stock_paleta: [0, [Validators.required, Validators.min(0)]],
      stock_pelota: [0, [Validators.required, Validators.min(0)]],
      duracion_minima_turno: [0, [Validators.required, Validators.min(0)]],
      duracion_maxima_turno: [0, [Validators.required, Validators.min(0)]],
      horario_inicio_pico: ['00:00:00'],
      horario_fin_pico: ['00:00:00'],
      monto_x_media_hora: [0, [Validators.required, Validators.min(0)]],
      dias_apertura: [[]]
    });

    this.obtenerConfiguracion();
    this.generarHorarios();

  }

  obtenerConfiguracion(): void {
    this.configuracionService.getConfiguracion().subscribe(config => {
      this.form.patchValue({
        monto_reserva: config.monto_reserva,
        monto_asociacion: config.monto_asociacion,
        porcentaje_seña: config.porcentaje_seña,
        descuento_socio: config.descuento_socio,
        monto_paletas: config.monto_paletas,
        monto_pelotas: config.monto_pelotas,
        stock_paleta: config.stock_paleta,
        stock_pelota: config.stock_pelota,
        duracion_minima_turno: config.duracion_minima_turno,
        duracion_maxima_turno: config.duracion_maxima_turno,
        horario_inicio_pico: config.horario_inicio_pico,
        horario_fin_pico: config.horario_fin_pico,
        monto_x_media_hora: config.monto_x_media_hora,
      });

      this.diasApertura = config.dias_apertura.map(dia => ({
        ...dia,
        abierto: dia.horario_inicio !== "00:00:00" && dia.horario_fin !== "00:00:00"
      }));

      this.originalValues = { ...this.form.value };
    });
  }
  
  formChanged(): boolean {
    return this.form.dirty || this.formModificado;
  }

  actualizarAbierto(index: number, nuevoValor: boolean) {
    this.diasApertura[index].abierto = nuevoValor;
    this.formModificado = true;
  }
  
  actualizarHorario(index: number, tipo: 'horario_inicio' | 'horario_fin', nuevoValor: string) {
    const [hora, minutos] = nuevoValor.split(":").map(num => parseInt(num, 10));
    const minutosRedondeados = minutos < 30 ? 0 : 30;
    const nuevoHorario = `${hora.toString().padStart(2, '0')}:${minutosRedondeados.toString().padStart(2, '0')}`;
    this.diasApertura[index][tipo] = nuevoHorario;
    this.formModificado = true;
  }
  
  generarHorarios() {
    const horas = [];
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const horaStr = h.toString().padStart(2, '0');
        const minStr = m.toString().padStart(2, '0');
        horas.push(`${horaStr}:${minStr}`);
      }
    }
    this.horasDisponibles = horas;
  }

  guardarConfiguracion(): void {
    if (this.form.invalid) {
      this.toastrService.error('Por favor, complete todos los campos correctamente.');
      return;
    }
  
    if (!this.duenioEmail) {
      this.toastrService.error('No se encontró el email del dueño.');
      return;
    }
  
    const formValues = this.form.value;
  
    const nuevaConfiguracion: ConfiguracionGeneral = {
      id: 1,
      ...formValues,
      dias_apertura: this.diasApertura.map(dia => ({
        id: dia.id,
        dia: dia.dia,
        horario_inicio: dia.abierto ? dia.horario_inicio : "00:00:00",
        horario_fin: dia.abierto ? dia.horario_fin : "00:00:00"
      }))
    };
    
    this.apiService.updateConfiguracion(this.duenioEmail, nuevaConfiguracion).subscribe({
      next: () => {
        this.toastrService.success('Configuración actualizada con éxito');
        this.originalValues = { ...this.form.value };
      },
      error: (error) => {
        this.toastrService.error('Hubo un error al actualizar la configuración');
      }
    });
  }

  // Método para sumar más mercadería (stock)
  sumarStock(tipo: 'pelotas' | 'paletas', cantidad: number): void {
    if (cantidad <= 0) {
      this.toastrService.error('La cantidad debe ser mayor que 0.');
      return;
    }

    if (tipo === 'pelotas') {
      this.form.patchValue({
        stock_pelota: this.form.get('stock_pelota')?.value + cantidad
      });
    } else {
      this.form.patchValue({
        stock_paleta: this.form.get('stock_paleta')?.value + cantidad
      });
    }
  }
}
