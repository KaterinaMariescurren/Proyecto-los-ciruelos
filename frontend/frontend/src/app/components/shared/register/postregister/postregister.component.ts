import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService, JugadorDTO } from '../../../../api.service';
import { AuthService } from '../../../../services/auth.service';
import { UserService } from '../../../../services/user-service.service';

@Component({
  selector: 'app-postregister',
  templateUrl: './postregister.component.html',
  styleUrls: ['./postregister.component.scss'],
})
export class PostRegisterComponent implements OnInit {
  form: FormGroup;
  playerCategories = [
    'Principiante', 'Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima'
  ];
  maxPhones = 4;
  errorMessages: string[] = [];

  email: string | null = null;
  name: string | null = null;
  lastName: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private toastrService: ToastrService,
    private userService: UserService,
  ) {
    this.form = this.formBuilder.group({
      phones: this.formBuilder.array([
        this.createPhoneControl()
      ]),
      playerCategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {

    this.email = this.userService.getUserEmail();
    this.name = this.userService.getUserName();

    if (!this.email || !this.name) {
      this.activatedRoute.queryParams.subscribe(params => {
        console.log('Params recibidos:', params);  // Asegúrate de ver los parámetros aquí
        this.email = params['email'] || '';
        const fullName = params['name'] ? params['name'].trim().split(/\s+/) : [];
      
        this.name = fullName.length > 0 ? fullName[0] : ''; // Primer nombre
        this.lastName = fullName.length > 1 ? fullName.slice(1).join(' ') : '';
      });
    }
    console.log("Email:",this.email);
    console.log("FullName: ", this.name);
  }

  // Getter para los teléfonos
  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }

  // Función para crear un control de teléfono
  createPhoneControl(): any {
    return this.formBuilder.control('', [
      Validators.required,
      Validators.pattern(/^\d{6,15}$/),
    ]);
  }

  // Función para agregar un teléfono
  addPhone(): void {
    if (this.phones.length < this.maxPhones) {
      this.phones.push(this.createPhoneControl());
    }
  }

  // Función para eliminar un teléfono
  removePhone(index: number): void {
    if (this.phones.length > 1) {
      this.phones.removeAt(index);
    }
  }

  // Envía los datos al backend
  submit(): void {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    const phones = this.phones.value;
    const playerCategory = this.form.get('playerCategory')?.value;
    const email = this.email;
    const name = this.name;

    if (!email || !name) {
      console.error("Faltan datos esenciales (email o nombre) para registrar al usuario.");
      return;
    }

    // Construcción del objeto JugadorDTO
    const jugadorDTO: JugadorDTO = {
      id: 0,
      nombre: name,
      apellido: "", // No se obtiene de Google, opcional
      email: email,
      categoria: playerCategory,
      socio: false,
      profesor: false,
      telefonos: phones.map((phone: string) => ({
        codigo: 0,
        numero: parseInt(phone, 10),
      })),
    };

    console.log('Enviando datos del postregistro:', jugadorDTO);

    this.apiService.registrarUsuario(jugadorDTO, "").subscribe({
      next: () => {
        this.toastrService.success('Registro exitoso', 'Éxito');
        // Obtener el rol y almacenarlo
        this.apiService.getRol().subscribe(roleData => {
          this.apiService.setRolInStorage(roleData.message);
          console.log("Rol guardado:", roleData.message);
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
        this.toastrService.error('Error al registrar en el backend', 'Error');
      }
    });
  }

  // Función para marcar todos los campos como tocados
  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach((controlName) => {
      const control = this.form.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
