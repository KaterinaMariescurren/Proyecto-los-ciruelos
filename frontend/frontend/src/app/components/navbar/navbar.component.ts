import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../api.service';
import { catchError, map, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUrl: string = '';
  isLoggedIn: boolean = false;
  rol: string | null = null;
  email: string | null = null;
  rol$!: Observable<string>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private toastrService: ToastrService,
    private cdRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url;
      }
    });
  
    this.authService.getUsuario().subscribe(user => {
      this.isLoggedIn = !!user;
      console.log("Usuario autenticado:", this.isLoggedIn);
    });
  
    this.rol$ = this.apiService.getRol().pipe(
      map((data: any) => data.message || 'none') // Extraer el mensaje correctamente
    );
    
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
  

  navigateOrScroll(sectionId: string) {
    if (this.currentUrl !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToSection(sectionId), 100);
      });
    } else {
      this.scrollToSection(sectionId);
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastrService.success('Has cerrado sesión correctamente', 'Logout');
  }

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
