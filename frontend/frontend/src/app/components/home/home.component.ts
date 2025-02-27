
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonProviders } from '../shared/login/cambiar_contrasenia/button_provider/button_providers.component'
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  rol: string | null = null;
  isLoggedIn: boolean = false;
  currentUrl: string = '';

  email: string | null = null;
  
  constructor(
        private router: Router,
        private authService: AuthService,
        private apiService: ApiService,
        private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Detectar cambios en la navegación
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    });

    // Verificar si el usuario está autenticado
    this.authService.getUsuario().subscribe(user => {
      this.isLoggedIn = !!user;
      console.log("Usuario autenticado:", this.isLoggedIn);

      if (this.isLoggedIn) {
        // Obtener el rol del usuario
        this.apiService.getRol().subscribe(response => {
          this.rol = response.message; // Puede ser "duenio", "empleado" o null
          console.log('Rol asignado:', this.rol);

          this.apiService.setRolInStorage(this.rol);
          this.cdRef.detectChanges(); // Forzar actualización de la vista
        });
      } else {
        this.rol = null;
        this.apiService.setRolInStorage("");
        this.cdRef.detectChanges();
      }
    });
  }

  asociarse(): void {
    this.router.navigate(['/beneficios']); // Cambia '/asociarse' a la ruta de tu página de asociación
  }

  navigateToLogin(): void {
    this.router.navigate(['/components/login']);
  }

  @ViewChild('calendario', { static: false }) calendario!: ElementRef;


  scrollToCalendar() {
    if (this.calendario) {
      this.calendario.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
