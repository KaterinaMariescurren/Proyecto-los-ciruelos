import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-modificar_valores',
  templateUrl: './modificar_valores.component.html',
  styleUrls: ['./modificar_valores.component.css']
})
export class ModificarValoresComponent implements OnInit {
  form!: FormGroup;

  monto_reserva = 0;
  monto_asociacion = 0;
  porcentaje_senia = 0;
  descuento_socio = 0;
  monto_paletas = 0;
  monto_pelotas = 0;
  stock_paletas = 0;
  stock_pelotas = 0;
  duracion_maxima_turno = 0;

  constructor(
    private formBuilder: FormBuilder,
    private toastrService: ToastrService,
    private configuracionService: ConfiguracionService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      monto_reserva: [0, [Validators.required, Validators.min(0)]],
      monto_asociacion: [0, [Validators.required, Validators.min(0)]],
      porcentaje_senia: [0, [Validators.required, Validators.min(0)]],
      descuento_socio: [0, [Validators.required, Validators.min(0)]],
      monto_paletas: [0, [Validators.required, Validators.min(0)]],
      monto_pelotas: [0, [Validators.required, Validators.min(0)]],
      stock_paletas: [0, [Validators.required, Validators.min(0)]],
      stock_pelotas: [0, [Validators.required, Validators.min(0)]],
      duracion_maxima_turno: [0, [Validators.required, Validators.min(0)]],
    });

    this.obtenerConfiguracion();
  }

  obtenerConfiguracion(): void {
    this.configuracionService.getConfiguracion().subscribe(config => {
      console.log(config);
      
      // Actualizamos los valores en el formulario
      this.form.patchValue({
        monto_reserva: config.monto_reserva,
        monto_asociacion: config.monto_asociacion,
        porcentaje_senia: config.porcentaje_seña,
        descuento_socio: config.descuento_socio,
        monto_paletas: config.monto_paletas,
        monto_pelotas: config.monto_pelotas,
        stock_paletas: config.stock_paletas,
        stock_pelotas: config.stock_pelotas,
        duracion_maxima_turno: config.duracion_maxima_turno,
      });
    });
  }
  

  guardarConfiguracion(): void {
    if (this.form.invalid) {
      this.toastrService.error('Por favor, complete todos los campos correctamente.');
      return;
    }

    const formValues = this.form.value;

    const nuevaConfiguracion = {
      monto_reserva: formValues.monto_reserva,
      monto_asociacion: formValues.monto_asociacion,
      porcentaje_senia : formValues.porcentaje_senia,
      descuento_socio : formValues.descuento_socio,
      monto_paletas : formValues.monto_paletas,
      monto_pelotas: formValues.monto_pelotas,
      stock_paletas: formValues.stock_paletas,
      stock_pelotas: formValues.stock_pelotas,
      duracion_maxima_turno: formValues.duracion_maxima_turno,
    };

    // Enviar al servidor la nueva configuración
    this.apiService.updateConfiguracion(nuevaConfiguracion).subscribe(
      response => {
        this.toastrService.success('Configuración actualizada con éxito');
      },
      error => {
        this.toastrService.error('Hubo un error al actualizar la configuración');
      }
    );
  }

  // Método para sumar más mercadería (stock)
  sumarStock(tipo: 'pelotas' | 'paletas', cantidad: number): void {
    if (cantidad <= 0) {
      this.toastrService.error('La cantidad debe ser mayor que 0.');
      return;
    }

    if (tipo === 'pelotas') {
      this.form.patchValue({
        stockPelotas: this.form.get('stockPelotas')?.value + cantidad
      });
    } else {
      this.form.patchValue({
        stockPaletas: this.form.get('stockPaletas')?.value + cantidad
      });
    }
  }
}
