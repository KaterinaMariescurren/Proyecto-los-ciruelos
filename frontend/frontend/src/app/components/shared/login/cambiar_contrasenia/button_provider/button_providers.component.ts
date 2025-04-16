import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router'; // Importa Router
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../../../api.service';

@Component({
  selector: 'app-button-providers',
  templateUrl: './button_providers.component.html',
  styleUrls: ['./button_providers.component.css']
})
export class ButtonProviders {
  @Input() isLogin: boolean = true; 
  @Output() googleData = new EventEmitter<any>(); 

  form: FormGroup;
  isGoogleSignInInProgress: boolean = false; 
  errorMessages: string[] = []; 

  constructor(
    private authService: AuthService, 
    private fb: FormBuilder, 
    private router: Router, 
    private api: ApiService,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) { 
    this.form = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  signInWithGoogle(): void {
    this.isGoogleSignInInProgress = true;
  
    this.authService.loginWithGoogleProvider().then(async (userData) => {
      if (userData) {
        console.log('Inicio de sesión exitoso con Google:', userData);
  
        const email = userData.user.email;
        const name = userData.user.displayName; // Obtener el nombre
        
        if (!email) {
          console.error("El email obtenido de Google es nulo.");
          this.toastrService.error("No se pudo obtener el email de Google.");
          return;
        }
  
        // Verificar si el usuario existe en el backend
        this.api.verificarUsuario(email).subscribe((response: any) => {
          if (response.registrado) {

            // Obtener el rol y almacenarlo
            this.api.getRol().subscribe(roleData => {
              this.api.setRolInStorage(roleData.message);
              console.log("Rol guardado:", roleData.message);
            });

            console.log('Usuario registrado, redirigiendo al home');
            this.router.navigate(["/home"], { replaceUrl: true });
            return;
          } else {
            console.log('Usuario no registrado, redirigiendo a postregister');
            this.router.navigate(["/postregister"], {
              queryParams: { email, name }, // ✅ Pasar email y nombre como parámetros
              replaceUrl: true
            });
            return;
          }
        }, error => {
          console.error("Error al verificar usuario:", error);
          this.toastrService.error("Error al verificar usuario, intenta de nuevo.");
        });
      }
    })
    .catch((error) => {
      console.error('Error durante el inicio de sesión con Google:', error);
      this.errorMessages.push('Error durante el inicio de sesión con Google. Intenta nuevamente.');
    })
    .finally(() => {
      this.isGoogleSignInInProgress = false;
    });
  }

  fillFormWithGoogleData(userData: any): void {
    this.form.patchValue({
      name: userData.name || '',
      email: userData.email || ''
    });
  }
}
