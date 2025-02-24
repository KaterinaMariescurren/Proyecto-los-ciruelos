import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, Credential } from '../../../services/auth.service';
import { FirebaseErrorService } from '../../../services/firebase-error.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../api.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  hide = true;
  form: FormGroup<LoginForm>;
  errorMessage: string | null = null;
  isGoogleSignInInProgress = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private firebaseError: FirebaseErrorService,
    private toastrService: ToastrService,
    private api: ApiService,
  ) {
    this.form = this.formBuilder.group({
      email: this.formBuilder.control('', { validators: [Validators.required], nonNullable: true }),
      password: this.formBuilder.control('', { validators: [Validators.required], nonNullable: true }),
    });
  }

  ngOnInit() {}

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Marca todos los campos como tocados
      return;
    }

    const { email, password } = this.form.value;

    if (email && password) {
      const credential: Credential = { email, password };

      this.authService.loginWithEmailAndPassword(credential)
        .then((user) => {
          //Verificar que el mail este registrado en el Backend sino no lo esta Mandar al PostRegister
          
          // Obtener el rol y almacenarlo
          this.api.getRol().subscribe(roleData => {
            this.api.setRolInStorage(roleData.message);
            console.log("Rol guardado:", roleData.message);
          });

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
          this.router.navigate([returnUrl]);
        })
        .catch((error) => {
          console.error('Código de error de Firebase:', error.code); // Verifica qué código está devolviendo Firebase
          this.errorMessage = this.firebaseError.codeError(error.code); // Muestra error en pantalla
          this.toastrService.error(this.errorMessage, "Error");
        });
    }
  }

  get isEmailValid(): string | boolean {
    const control = this.form.get('email');
    if (control?.invalid && control.touched && control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    return false;
  }

  get isPasswordValid(): string | boolean {
    const control = this.form.get('password');
    if (control?.invalid && control.touched && control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    return false;
  }
}
