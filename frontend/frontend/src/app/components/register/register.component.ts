import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonProviders } from '../login/Cambiar-Contrasenia/button-providers/button-providers.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router'; 
import { MatSelectModule } from '@angular/material/select';

interface RegisterForm {
  names: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  phone: FormControl<string>;
  playerCategory: FormControl<string>;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSelectModule,
    ButtonProviders,
  ],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export default class RegisterComponent {
  hide = true;
  formBuilder = inject(FormBuilder);
  router = inject(Router); 

  form: FormGroup<RegisterForm> = this.formBuilder.group({
    names: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    lastName: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    email: this.formBuilder.control('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    phone: this.formBuilder.control('', {
      validators: [Validators.required, Validators.pattern(/^\d{10}$/)],
      nonNullable: true,
    }),
    playerCategory: this.formBuilder.control('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  signUp(): void {
    if (this.form.invalid) return;
    console.log(this.form.value);
  }

  get isEmailValid(): string | boolean {
    const control = this.form.get('email');
    if (control?.invalid && control.touched) {
      return control.hasError('required')
        ? 'Este campo es obligatorio'
        : 'Ingresa un correo electrónico válido';
    }
    return false;
  }

  goBack(): void {
    this.router.navigate(['/components/login']); 
  }
}
