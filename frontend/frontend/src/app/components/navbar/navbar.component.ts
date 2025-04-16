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
  isLoggedIn$!: Observable<boolean>;
  rol: string | null = null;
  email: string | null = null;

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
    this.apiService.getRolObservable().subscribe(rol => {
      this.rol = rol;
      this.cdRef.detectChanges(); // Refrescar la vista si hace falta
    });
    this.isLoggedIn$ = this.authService.isAuthenticated$();
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
