
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  email: string | null = null;
  
  constructor(
        private router: Router,
        private authService: AuthService,
        private apiService: ApiService,
        private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.apiService.getRol().subscribe({
      next: (data: any) => {
        this.rol = data.message; 
        console.log("Rol obtenido:", this.rol); // <-- Agrega este log
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.rol = 'none';
        console.error("Error al obtener el rol:", err);
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
