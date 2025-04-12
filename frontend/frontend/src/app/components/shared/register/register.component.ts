import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Credential } from '../../../services/auth.service';
import { FirebaseErrorService } from '../../../services/firebase-error.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService, JugadorDTO } from '../../../api.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  showPasswordRequirements: boolean = false;
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
  };
  errorMessages: string[] = [];
  maxPhones: number = 4; // Número máximo de teléfonos
  playerCategories = [
    'Principiante', 'Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Septima'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private firebaseError: FirebaseErrorService,
    private toastrService: ToastrService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Expresión regular mejorada
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/\d/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      playerCategory: ['', [Validators.required]],
      phones: this.formBuilder.array([this.createPhoneControl()]),
    });
  
    // Suscripción a los cambios en el campo de la contraseña
    this.form.get('password')?.valueChanges.subscribe((password: string) => {
      this.checkPasswordRequirements(password);
    });
  }
  

  async signUp(): Promise<void> {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }
  
    const { email, password, name, lastName, playerCategory, phones } = this.form.value;
  
    if (email && password) {
      const credential: Credential = { email, password };
      try {
  
        // Datos a enviar al backend
        const jugadorDTO: JugadorDTO = {
          id: 0,
          nombre: name,
          apellido: lastName,
          email: email,
          categoria: playerCategory,
          socio: false,
          profesor: false,
          telefonos: phones.map((phones:string)=>{
            return {
              codigo: 0,
              numero: parseInt(phones, 10),
            }
          }),
        };
  
        // Llamar al servicio para registrar el usuario en el backend
        this.apiService.registrarUsuario(jugadorDTO, password).subscribe({
          next: () => {
            this.authService.loginWithEmailAndPassword(credential);
            this.toastrService.success('Registro exitoso, verifique su email', 'Éxito');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error al registrarse:', error);
            this.toastrService.error('Error al registrar en el backend', 'Error');
          }
        });
  
      } catch (error: any) {
        console.error('Error en signUp:', error);
        this.toastrService.error(this.firebaseError.codeError(error.code), "Error");
      }
    }
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

  // Función para obtener los teléfonos del formulario
  get phones(): FormArray {
    return this.form.get('phones') as FormArray;
  }

  // Función de validación de contraseñas coincidentes
  checkPasswordMatch(): void {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    if (confirmPassword && password !== confirmPassword) {
      this.form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.form.get('confirmPassword')?.setErrors(null);
    }
  }

  // Verificación de los requisitos de la contraseña
  checkPasswordRequirements(password: string): void {
    this.passwordRequirements.minLength = password.length >= 6;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(password);
    this.passwordRequirements.hasNumber = /\d/.test(password);
  }

  // Funciones para mostrar/ocultar la contraseña
  onFocusPassword(): void {
    this.showPasswordRequirements = true;
  }

  onBlurPassword(): void {
    this.showPasswordRequirements = false;
  }

  toggleHideConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
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

  // Función para manejar el regreso (si se requiere)
  goBack(): void {
    this.router.navigate(['/']);
  }
}
