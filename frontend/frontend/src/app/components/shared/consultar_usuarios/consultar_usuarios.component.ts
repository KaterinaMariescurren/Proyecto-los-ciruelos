import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiService } from '../../../api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'consultar-usuarios',
  templateUrl: './consultar_usuarios.component.html',
  styleUrls: ['./consultar_usuarios.component.css']
})
export class ConsultarUsuariosComponent {
  // Variables de usuario y búsqueda
  usuarioActual: any;
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  busqueda: string = '';

  // Variables de rol y email del usuario autenticado
  rol: string | null = null;
  email: string | null = null;

  // Filtros de la tabla
  filtro = {
    categoria: '',
    socio: '',
    profesor: '',
  };

  // Categorías disponibles
  categorias: string[] = [
    'Principiante', 'Primera', 'Segunda', 'Tercera',
    'Cuarta', 'Quinta', 'Sexta', 'Séptima'
  ];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  /**
   * Obtiene la lista de usuarios y filtra solo los jugadores
   */
  obtenerUsuarios(): void {
    this.apiService.getRol().subscribe({
      next: (data: any) => {
        this.rol = data.message;
        console.log("Rol obtenido:", this.rol);

        this.cdRef.detectChanges();

        if (this.rol === 'duenio') {
          this.apiService.getUsuarios().subscribe({
            next: (usuarios) => {
              console.log("Usuarios obtenidos del backend:", usuarios);
              
              // Filtrar solo los jugadores (sin rol de dueño)
              this.usuarios = usuarios.filter(usuario => !('duenio' in usuario));
              this.usuariosFiltrados = [...this.usuarios];
              console.log("Usuarios filtrados (solo jugadores):", this.usuariosFiltrados);
            },
            error: (err) => {
              console.error("Error al obtener usuarios:", err);
            }
          });
        }
      },
      error: (err) => {
        console.error("Error al obtener rol:", err);
      }
    });
  }

  /**
   * Elimina un usuario con confirmación previa
   */
  eliminarUsuario(usuarioId: number): void {
    if (confirm("¿Está seguro de eliminar este usuario?")) {
      this.apiService.eliminarUsuario(usuarioId).subscribe(() => {
        console.log("Usuario eliminado");
        this.obtenerUsuarios(); // Refresca la lista
      });
    }
  }

  /**
   * Filtra los usuarios según los criterios seleccionados
   */
  filtrarUsuarios(): void {
    if (!this.usuarios.length) return;

    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const coincideBusqueda = !this.busqueda || usuario.nombre?.toLowerCase().startsWith(this.busqueda.toLowerCase()) || usuario.apellido?.toLowerCase().startsWith(this.busqueda.toLowerCase()) || usuario.email?.toLowerCase().startsWith(this.busqueda.toLowerCase());
      const coincideCategoria = !this.filtro.categoria || usuario.categoria === this.filtro.categoria;
      const coincideSocio = !this.filtro.socio || (usuario.socio ? 'Si' : 'No') === this.filtro.socio;
      const coincideProfesor = !this.filtro.profesor || (usuario.profesor ? 'Si' : 'No') === this.filtro.profesor;

      return coincideBusqueda && coincideCategoria && coincideSocio && coincideProfesor;
    });
  }

  /**
   * Restablece los filtros y muestra todos los usuarios
   */
  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtro = { categoria: '', socio: '', profesor: '' };
    this.usuariosFiltrados = [...this.usuarios];
  }

  // Columnas de la tabla
  displayedColumns: string[] = ['nombre', 'email', 'categoria', 'socio', 'profesor', 'acciones'];

  // Variables para modales
  mostrarModal = false;
  accionModal = '';
  usuarioSeleccionado: any;
  mostrarModalDesasociar = false;
  usuarioSeleccionadoDesasociar: any;

  /**
   * Abre el modal para asignar rol de socio o profesor
   */
  abrirModal(usuario: any, accion: string) {
    this.usuarioSeleccionado = usuario;
    this.accionModal = accion;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  /**
   * Asigna el rol de socio o profesor al usuario seleccionado
   */
  confirmarAccion() {
    if (!this.usuarioSeleccionado) return;

    this.authService.getUserEmail().subscribe((duenioEmail) => {
      if (!duenioEmail) {
        this.toastrService.error('No se pudo obtener el email del dueño', 'Error');
        return;
      }

      const accion = this.accionModal === 'profesor' ? this.apiService.asignarRolProfesor : this.apiService.asignarRolSocio;

      accion.call(this.apiService, duenioEmail, this.usuarioSeleccionado.id).subscribe({
        next: () => {
          this.toastrService.success(`El usuario ${this.usuarioSeleccionado.nombre} ahora es ${this.accionModal}`);
          this.obtenerUsuarios();
        },
        error: () => {
          this.toastrService.error(`Error al asignar el rol de ${this.accionModal}`, 'Error');
        }
      });

      this.cerrarModal();
    });
  }

  /**
   * Abre el modal para desasociar un socio
   */
  abrirModalDesasociar(usuario: any) {
    this.usuarioSeleccionadoDesasociar = usuario;
    this.mostrarModalDesasociar = true;
  }

  cerrarModalDesasociar() {
    this.mostrarModalDesasociar = false;
  }

  /**
   * Desasocia un usuario del rol de socio
   */
  confirmarDesasociacion() {
    if (!this.usuarioSeleccionadoDesasociar) return;

    this.authService.getUserEmail().subscribe((duenioEmail) => {
      if (!duenioEmail) {
        this.toastrService.error('No se pudo obtener el email del dueño', 'Error');
        return;
      }

      this.apiService.sacarRolSocio(duenioEmail, this.usuarioSeleccionadoDesasociar.id).subscribe({
        next: () => {
          this.toastrService.success(`El usuario ${this.usuarioSeleccionadoDesasociar.nombre} ha sido desasociado`);
          this.obtenerUsuarios();
        },
        error: () => {
          this.toastrService.error('Error al desasociar el jugador', 'Error');
        }
      });

      this.cerrarModalDesasociar();
    });
  }
}
