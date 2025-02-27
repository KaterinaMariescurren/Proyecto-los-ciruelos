import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ApiService, EmpleadoDTO } from '../../../api.service';
import { MatTableDataSource } from '@angular/material/table';

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
  rol: string | null = null;
  email: string | null = null;

  empleados: EmpleadoDTO[] = [];
  empleadosFiltrados: EmpleadoDTO[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }
  
  empleadosDataSource = new MatTableDataSource<EmpleadoDTO>();

  obtenerUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.empleados = usuarios
          .filter(usuario => 'duenio' in usuario && usuario.duenio === false)
          .map(usuario => ({
            email: usuario.email,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            telefonos: usuario.telefonos || [],
            duenio: usuario.duenio
          }) as EmpleadoDTO);
  
        this.empleadosFiltrados = [...this.empleados]; // Actualizar lista
        this.empleadosDataSource.data = this.empleadosFiltrados; // 🔥 Importante para actualizar la tabla
      }
    });
  }

  eliminarUsuario(usuarioId: number): void {
    if (confirm("¿Está seguro de eliminar este usuario?")) {
      this.apiService.eliminarUsuario(usuarioId).subscribe((resultado) => {
        console.log("Usuario eliminado:", resultado);
        this.obtenerUsuarios();
      });
    }
  }

  filtrarUsuarios(): void {
    if (!this.empleados || this.empleados.length === 0) {
      console.warn("⚠ Intentando filtrar sin empleados cargados.");
      return;
    }
  
    this.empleadosFiltrados = this.empleados.filter(empleado => {
      const coincideBusqueda =
        !this.busqueda ||
        empleado.nombre?.toLowerCase().startsWith(this.busqueda.toLowerCase()) ||
        empleado.apellido?.toLowerCase().startsWith(this.busqueda.toLowerCase()) ||
        empleado.email?.toLowerCase().startsWith(this.busqueda.toLowerCase());
  
      return coincideBusqueda;
    });
  
    // 🔥 Importante: Actualiza el DataSource para que la tabla se refresque
    this.empleadosDataSource.data = this.empleadosFiltrados;
    console.log("Empleados después de filtrar:", this.empleadosFiltrados);
  }
  


  // Restablece los filtros y muestra todos los usuarios
  limpiarFiltros(): void {
    this.busqueda = '';
    this.usuariosFiltrados = [...this.usuarios]; // Restaurar la lista original
    console.log("🔄 Filtros limpiados, usuarios restaurados.");
  }

  displayedColumns: string[] = ['nombre', 'email', 'acciones'];
}
