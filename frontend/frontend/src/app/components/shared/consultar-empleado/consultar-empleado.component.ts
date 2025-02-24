import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-consultar-empleado',
  templateUrl: './consultar-empleado.component.html',
  styleUrl: './consultar-empleado.component.css'
})
export class ConsultarEmpleadoComponent {
 usuarioActual: any;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busqueda: string = '';

  constructor(
    private authService: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    // Verificar si el usuario es un administrador antes de hacer la solicitud
    this.authService.getUserRole().subscribe(role => {
      if (role === 'admin') {
        this.api.getUsuarios().subscribe((usuarios) => {
          this.usuarios = usuarios;
          this.usuariosFiltrados = usuarios;
        });
      } else {
        console.error("Acceso denegado: Solo el administrador puede ver los usuarios.");
      }
    });
  }

  eliminarUsuario(usuarioId: number): void {
    if (confirm("¿Está seguro de eliminar este usuario?")) {
      this.api.eliminarUsuario(usuarioId).subscribe((resultado) => {
        console.log("Usuario eliminado:", resultado);
        this.obtenerUsuarios();
      });
    }
  }

  filtrarUsuarios(): void {
    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      return (
        (!this.busqueda || 
          usuario.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) || 
          usuario.apellido.toLowerCase().includes(this.busqueda.toLowerCase()) ||
          usuario.email.toLowerCase().includes(this.busqueda.toLowerCase())
        )
      );
    });
  }

  displayedColumns: string[] = ['nombre', 'email', 'acciones'];
}
