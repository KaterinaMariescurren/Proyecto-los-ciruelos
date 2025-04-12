import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verificar-correo',
  templateUrl: './verificar-correo.component.html',
  styleUrls: ['./verificar-correo.component.scss']
})
export class VerificarCorreoComponent implements OnInit {
  isLoading = false; // Para mostrar un spinner si es necesario

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const oobCode = params['oobCode'];
      if (oobCode) {
        this.verificarCorreo(oobCode);
      } else {
        this.toastr.warning('Código de verificación no proporcionado.');
        this.router.navigate(['/login']);
      }
    });
  }

  private verificarCorreo(oobCode: string): void {
    this.isLoading = true;
    this.authService.verifyEmailWithCode(oobCode)
      .then(() => {
        // Esperar 3 segundos antes de redirigir
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      })
      .catch(error => {
        console.error('Error en la verificación del correo:', error);
        this.toastr.error('El enlace de verificación no es válido o ha expirado.');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

}
