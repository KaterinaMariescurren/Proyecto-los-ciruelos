import { Component } from '@angular/core';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'consultar-usuarios',
  templateUrl: './consultar_usuarios.component.html',
  styleUrls: ['./consultar_usuarios.component.css']
})

export class ConsultarUsuariosComponent {
  usuarioActual: any;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busqueda: string = '';

  filtro = {
    categoria: '',
    socio: '',      
    profesor: '' ,  
  };

  categorias: string[] = [
    'Principiante', 'Primera', 'Segunda', 'Tercera', 
    'Cuarta', 'Quinta', 'Sexta', 'Séptima'
  ];

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
        ) &&
        (!this.filtro.categoria || usuario.categoria === this.filtro.categoria) &&
        (!this.filtro.socio || usuario.socio.toString().toLowerCase() === this.filtro.socio.toLowerCase()) &&
        (!this.filtro.profesor || usuario.profesor.toString().toLowerCase() === this.filtro.profesor.toLowerCase())
      );
    });
  }

  seleccionarCategoria(categoria: string): void {
    this.filtro.categoria = this.filtro.categoria === categoria ? '' : categoria;
    this.filtrarUsuarios();
  }

  seleccionarSocio(valor: string): void {
    this.filtro.socio = this.filtro.socio === valor ? '' : valor;
    this.filtrarUsuarios();
  }

  seleccionarProfesor(valor: string): void {
    this.filtro.profesor = this.filtro.profesor === valor ? '' : valor;
    this.filtrarUsuarios();
  }

  displayedColumns: string[] = ['nombre', 'email', 'categoria', 'socio', 'profesor', 'acciones'];
}
