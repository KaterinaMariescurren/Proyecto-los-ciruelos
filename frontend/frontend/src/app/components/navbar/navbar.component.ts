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
  
      if (this.isLoggedIn) {
        this.apiService.getRol().subscribe(response => {
          this.rol = response.message; // Ahora puede ser "duenio", "empleado" o null
          console.log('Rol asignado:', this.rol);
  
          this.apiService.setRolInStorage(this.rol);
          this.cdRef.detectChanges(); // Forzar actualización del Navbar/Sidebar
        });
      } else {
        this.rol = null;
        this.apiService.setRolInStorage("");
        this.cdRef.detectChanges();
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
    this.apiService.setRolInStorage(""); // Eliminar el rol del storage
    this.rol = null; // Resetear el rol en la vista
    this.cdRef.detectChanges(); // Forzar la actualización del navbar
    this.toastrService.success('Has cerrado sesión correctamente', 'Logout');
    this.router.navigate(['/home']); // Redireccionar a home
  }  

  private scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
