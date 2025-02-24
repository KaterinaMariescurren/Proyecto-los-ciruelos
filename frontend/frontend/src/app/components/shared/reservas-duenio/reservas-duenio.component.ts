import { Component, ElementRef, HostListener } from '@angular/core';
import { Court } from '../calendario_reserva/calendario_reserva.component';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService, Reserva, TurnoDTO } from '../../../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservas-duenio',
  templateUrl: './reservas-duenio.component.html',
  styleUrl: './reservas-duenio.component.css'
})
export class ReservasDuenioComponent {
 selectedDate: string = new Date().toISOString().split('T')[0];
  minDate: string = this.getMinDate();
  currentHour: number = new Date().getHours();

  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  timeSlotsDisplay = [
    '8', '8:30', '9', '9:30', '10', '10:30', '11', '11:30', '12', '12:30', 
    '13', '13:30', '14', '14:30', '15', '15:30', '16', '16:30', '17', '17:30', 
    '18', '18:30', '19', '19:30', '20', '20:30', '21', '21:30', '22'
  ];

  courts: Court[] = [
    { id: 1, name: 'Cancha 1' },
    { id: 2, name: 'Cancha 2' },
    { id: 3, name: 'Cancha 3' },
    { id: 4, name: 'Cancha 4' }
  ];

  reservations: Reserva[] = [];
  isLoggedIn: boolean = false;
  isSocio: boolean = false;

  showOptionsMenu = false;
  optionsMenuPosition = { top: 0, left: 0 };
  highlightedCells: { courtId: number, slot: string }[] = [];
  halfHighlightedCell: { courtId: number, slot: string } | null = null;
  lastHighlightedCell: { courtId: number, slot: string } | null = null; // Nueva propiedad para la última celda resaltada

  selectedCourt: Court | null = null; // Guardar la cancha seleccionada
  selectedSlot: string | null = null; // Guardar el horario seleccionado

  configuracion: ConfiguracionGeneral | null = null;

  constructor(
    private elementRef: ElementRef, 
    private authService: AuthService, 
    private toastrService: ToastrService,
    private api: ApiService,  
    private router: Router,
    private configuracionService: ConfiguracionService,
  ) {
    this.authService.authState$.subscribe(user => {
      this.isLoggedIn = !!user; // Si hay un usuario, isLoggedIn es true
    });
    this.api.getPerfil().subscribe((perfil) => {
      console.log(perfil.socio);
      this.isSocio = perfil?.socio ?? false; // Si el campo "socio" es true, se guarda en isSocio
    });
  }

  ngOnInit() {
    this.cargarRerservaciones();
    // Primero revisamos si ya tenemos la configuración almacenada
    this.configuracion = this.configuracionService.getStoredConfiguracion();

    // Si no la tenemos, la obtenemos del backend
    if (!this.configuracion) {
      this.configuracionService.getConfiguracion().subscribe(config => {
        // Guardamos la configuración para poder usarla más tarde
        this.configuracionService.setConfiguracion(config);
        this.configuracion = config;
      });
    }
  }

  onButtonClick() {
    if (this.isLoggedIn) {
      console.log(this.selectedCourt?.id);
      console.log(this.selectedDate);
      console.log(this.selectedSlot);
      const selectedDate = this.selectedDate; // Fecha seleccionada en el calendario
      const startTime = this.selectedSlot ?? ""; // El horario de inicio es el slot donde el usuario hace click
      const endTime = this.getEndTime(startTime); // El horario de fin será 90 minutos después
      console.log(endTime);

      const turnoDTO: TurnoDTO = {
        id_cancha: this.selectedCourt?.id ?? 0, // Reemplaza con el ID de la cancha
        fecha: selectedDate, // Fecha en formato adecuado
        horario_inicio_ocupado: startTime ?? "", // Horario inicio en formato HH:mm
        horario_fin_ocupado: endTime // Horario fin en formato HH:mm
      };

      // Bloquear el turno a través de la API
      this.api.bloquearTurno(turnoDTO).subscribe({
        next: (response) => {
          // Si la respuesta es exitosa, redirige a la página de ticket
          console.log('Respuesta de la API:', response); // Verifica que la respuesta sea correcta
          if (response?.message === "Se bloqueo el turno") {

            this.router.navigate(['/reserva'], {
              queryParams: {
                id_cancha: turnoDTO.id_cancha,
                fecha: turnoDTO.fecha,
                horario_inicio_ocupado: turnoDTO.horario_inicio_ocupado,
                horario_fin_ocupado: turnoDTO.horario_fin_ocupado,
              }
            });
          }
        },
        error: (err) => {
          // Si ocurre algún error en el bloqueo, muestra un mensaje de error
          console.error('Error al bloquear el turno', err);
          this.toastrService.error('Hubo un error al intentar bloquear el turno.', 'Error');
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }  

  cargarRerservaciones() {
    this.api.getTurnos().subscribe(
      (turnos) => {
        this.reservations = turnos.filter(turno => turno.fecha === this.selectedDate).map(turno => ({
          id_cancha: turno.id_cancha,
          horario_inicio_ocupado: turno.horario_inicio_ocupado,
          horario_fin_ocupado: turno.horario_fin_ocupado,
          fecha: turno.fecha
        }));
        console.log('Reservas cargadas:', this.reservations);
      },
      (error) => {
        console.error('Error al cargar los turnos', error);
      }
    );
  }
  

  getMinDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.cargarRerservaciones(); // Volver a cargar las reservas del backend
    this.clearSelectedCells();
    this.hideOptionsMenu();
  }  

  clearSelectedCells(): void {
    this.highlightedCells = [];
    this.halfHighlightedCell = null;
  }

  hideOptionsMenu(): void {
    this.showOptionsMenu = false;
    this.clearSelectedCells(); // Limpia la selección si el menú se cierra sin elegir
  }
  
  showTimeOptions(court: Court, slot: string, event: MouseEvent) {
    this.highlightedCells = []; 
    this.showOptionsMenu=false;
  
    this.selectedCourt = court;
    this.selectedSlot = slot; 

    // Verificar si la celda está ocupada (reservada)
    if (this.isReserved(court.id, slot)) {
      return; 
    }
  
    const slotIndex = this.timeSlots.indexOf(slot);
    
    if (slotIndex !== -1) {
      // Verificar si la celda tiene conflicto de tiempo
      if (this.isNotEnoughTimeBetweenReservations(court.id, slot)) {
        // Si hay conflicto de tiempo, solo bloqueamos visualmente (no hacemos nada)
        return;
      }
  
      // Ahora calculamos las celdas hasta la hora de finalización
      const endTime = this.getEndTime(slot); // Obtener el tiempo de finalización
      let endSlotIndex = this.timeSlots.indexOf(endTime);
  
      if (endSlotIndex !== -1) {
        // Resaltar todas las celdas entre start y end
        if (slotIndex == endSlotIndex){
          return
        }else{

          let cantidad_celdas_sin_rojo = 0;
          for (let i = slotIndex ; i <= endSlotIndex; i++) {
            if (this.isReserved(court.id, this.timeSlots[i])!=='red') {
              cantidad_celdas_sin_rojo=cantidad_celdas_sin_rojo+1;
              if((cantidad_celdas_sin_rojo==4)){
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlots[i] });
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlots[i-1] });
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlots[i-2] });
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlots[i-3] });
                this.showOptionsMenu = true;
              }else{
                this.showOptionsMenu = false;
              }
            }
          }
          // Obtener posición del menú
          const target = event.target as HTMLTableCellElement;
          const rect = target.getBoundingClientRect();
        
          this.optionsMenuPosition = {
            top: rect.top + window.scrollY + target.offsetHeight,
            left: rect.left + window.scrollX + rect.width / 2 - 100
          };
        }
      }
    }
  
  }
  
  isNotEnoughTimeBetweenReservations(courtId: number, slot: string): boolean {
    const selectedTimeInMinutes = this.timeToMinutes(slot); // Convertir la celda a minutos
    const minGap = 90; // 90 minutos de diferencia mínima
  
    // Filtrar las reservas de la cancha seleccionada
    const courtReservations = this.reservations.filter(res => res.id_cancha === courtId);
  
    // Verificar las reservas en el mismo court
    for (const reservation of courtReservations) {
      const startTimeInMinutes = this.timeToMinutes(reservation.horario_inicio_ocupado);
      const endTimeInMinutes = this.timeToMinutes(reservation.horario_fin_ocupado);
  
      // Verificar si la celda seleccionada está en conflicto con la reserva actual
      if (Math.abs(selectedTimeInMinutes - endTimeInMinutes) < minGap || 
          Math.abs(startTimeInMinutes - selectedTimeInMinutes) < minGap) {
        return false;  // Cambié para permitir el clic, pero podrían ser marcadas de alguna forma
      }
    }
  
    return false; // Si no hay conflictos, retornar false, es decir, no está bloqueada
  }   

  getEndTime(startTime: string): string {
    const [hour, minute] = startTime.split(':').map(Number);
    let endHour = hour;
    let endMinute = minute + 90;  // Duración estándar de 1h30min
  
    if (endMinute >= 60) {
      endHour += Math.floor(endMinute / 60);
      endMinute = endMinute % 60;
    }
  
    return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
  }

  clearHighlightedCells(): void {
    // Limpia las celdas resaltadas y la media celda resaltada
    this.highlightedCells = [];
    this.halfHighlightedCell = null;
  }  

  isHighlighted(courtId: number, slot: string): boolean {
    return this.highlightedCells.some(cell => cell.courtId === courtId && cell.slot === slot);
  }  
  
  isHalfHighlighted(courtId: number, slot: string): boolean {
    return this.halfHighlightedCell !== null && this.halfHighlightedCell.courtId === courtId && this.halfHighlightedCell.slot === slot;
  }

  isPastTime(slot: string, ): boolean {
    const [hour, minute] = slot.split(':').map(Number);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (this.selectedDate < this.minDate) {
      return true;
    }

    if (this.selectedDate === this.minDate) {
      return hour < currentHour || (hour === currentHour && minute <= currentMinute);
    }

    return false;
  }

  // Función para convertir una hora en formato HH:mm a minutos desde las 00:00
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isReserved(courtId: number, slot: string): string {
    const slotMinutes = this.timeToMinutes(slot); // Convertir la celda a minutos
    // Recorremos todas las reservas de la cancha
    for (const reservation of this.reservations) {
      if (reservation.id_cancha === courtId) {
        const startMinutes = this.timeToMinutes(reservation.horario_inicio_ocupado);
        const endMinutes = this.timeToMinutes(reservation.horario_fin_ocupado);
        
        // Verificamos si el slot está dentro del rango de la reserva, incluyendo el final
        if (slotMinutes >= startMinutes && slotMinutes <= endMinutes) {
          const duration = endMinutes - startMinutes;
          if (duration >= 90) {
            return 'red'; // Solo devolver 'red' si la duración es de 90 minutos o más
          }
        }
      }
    }
  
    return ''; // Si no está en ninguna reserva o no tiene 90 minutos, no pintamos la celda
  }
  

  // Detectar clics en todo el documento y cerrar el menú si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.hideOptionsMenu();
    }
  }
}
