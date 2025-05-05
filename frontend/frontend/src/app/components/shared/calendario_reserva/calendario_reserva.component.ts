import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService, Reserva, TurnoDTO } from '../../../api.service';
import { Router } from '@angular/router';
import { ConfiguracionGeneral, ConfiguracionService } from '../../../services/configuracion-general.service';
import { Observable } from 'rxjs';

export interface Court {
  id: number;
  name: string;
}

@Component({
  selector: 'app-calendario_reserva',
  templateUrl: './calendario_reserva.component.html',
  styleUrl: './calendario_reserva.component.css'
})
export class CalendarioReservaComponent implements OnInit {
  selectedDate: string = '';
  minDate: string = this.getMinDate();
  currentHour: number = new Date().getHours();

  // Horarios genericos
  timeSlots = [
    '00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30',
    '05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
    '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30', 
    '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30', 
    '20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'
  ];

  timeSlotsDelDia: string[] = [];

  courts: Court[] = [
    { id: 1, name: 'Cancha 1' },
    { id: 2, name: 'Cancha 2' },
    { id: 3, name: 'Cancha 3' },
    { id: 4, name: 'Cancha 4' }
  ];

  reservations: Reserva[] = [];
  isLoggedIn$!: Observable<boolean>;
  isSocio: boolean = false;
  isRegistrado: boolean = false;

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
  ) {}

  ngOnInit() {
    this.selectedDate = this.getCurrentDate();
    this.actualizarTimeSlotsDelDia(); 

    // Primero revisamos si ya tenemos la configuración almacenada
    this.configuracion = this.configuracionService.getStoredConfiguracion();

    // Si no la tenemos, la obtenemos del backend
    if (!this.configuracion) {
      this.configuracionService.getConfiguracion().subscribe(config => {
        // Guardamos la configuración para poder usarla más tarde
        this.configuracionService.setConfiguracion(config);
        this.configuracion = config;
        this.actualizarTimeSlotsDelDia();
      });
    }else{
      this.actualizarTimeSlotsDelDia();
    }
    this.isLoggedIn$ = this.authService.isAuthenticated$();
    this.isLoggedIn$.subscribe(isLogged => {
      if (isLogged) {
        this.api.getPerfil().subscribe((perfil) => {
          if (perfil?.socio !== undefined) {
            this.isSocio = perfil.socio;
            this.isRegistrado = true;
          } else {
            this.isRegistrado = false;
          }
        });
      }
    });
  }

  obtenerHorariosDisponibles(): string[] {
    if (!this.configuracion || !this.selectedDate) return [];
  
    // Obtener el día de la semana formateado correctamente
    const diaSemana = this.getDiaDeLaSemana(this.selectedDate); // El día formateado como "Lunes", "Martes", etc.
    
    // Buscar el día de apertura en la configuración que coincida con el día de la semana
    const diaApertura = this.configuracion.dias_apertura.find(d => d.dia === diaSemana);
  
    if (!diaApertura) {
      console.log(`No hay horarios disponibles para ${diaSemana}`);  // Debugging
      return [];  // No hay horarios disponibles para este día
    }
  
    // Obtener el rango de horas disponibles para este día
    const startMinutes = this.timeToMinutes(diaApertura.horario_inicio);
    const endMinutes = this.timeToMinutes(diaApertura.horario_fin);
  
    // Filtrar los horarios disponibles que caen dentro del rango de apertura
    return this.timeSlots.filter(time => {
      const minutes = this.timeToMinutes(time);
      return minutes >= startMinutes && minutes <= endMinutes;
    });
  }  

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  actualizarTimeSlotsDelDia(): void {
    if (!this.configuracion || !this.selectedDate) {
      this.timeSlotsDelDia = [];
      return;
    }
  
    const diaSemana = this.getDiaDeLaSemana(this.selectedDate); // ej: "Lunes"
    console.log("Dia:" + diaSemana);
    const diaApertura = this.configuracion.dias_apertura.find(d => d.dia === diaSemana);
  
    if (!diaApertura) {
      this.timeSlotsDelDia = [];
      return;
    }
    
    console.log(diaApertura.horario_inicio)
    console.log(diaApertura.horario_fin)
    const startMinutes = this.timeToMinutes(diaApertura.horario_inicio);
    const endMinutes = this.timeToMinutes(diaApertura.horario_fin);
  
    this.timeSlotsDelDia = this.timeSlots.filter(time => {
      const minutes = this.timeToMinutes(time);
      return minutes >= startMinutes && minutes <= endMinutes;
    });
    console.log(this.timeSlotsDelDia)
  }  

  onButtonClick() {
    this.authService.isAuthenticated$().subscribe((isLogged) => {
      if (!isLogged) {
        this.router.navigate(['/login']);
        return;
      }
      if (!this.isRegistrado) {
        this.toastrService.info('Debes completar tus datos antes de continuar.', 'Completar Datos');
        this.router.navigate(['/postregister']);
        return;
      }

      const selectedDate = this.selectedDate; // Fecha seleccionada en el calendario
      const startTime = this.selectedSlot ?? ""; // El horario de inicio es el slot donde el usuario hace click
      const endTime = this.getEndTime(startTime); // El horario de fin será 90 minutos después

    
    })
  }  

  getDiaDeLaSemana(dateString: string): string {
    const dias = [ 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
    const date = new Date(dateString);
  
    const dia = date.getDay();  // 0 para domingo, 1 para lunes, etc.
  
    return dias[dia];
  }
  
  formatSlotDisplay(slot: string): string {
    // Verifica si el slot termina con ":00"
    const [hour, minute] = slot.split(':');
    if (minute === '00') {
      return hour; // Solo muestra la hora sin minutos
    }
    return slot; // Si no termina en ":00", devuelve la hora y los minutos
  }  
  
  getMinDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getFormattedTimeSlots() {
    return this.timeSlots.map((slot) => {
      const [hour, minute] = slot.split(':').map(Number);
      if (minute === 0) {
        // Si es una hora exacta, solo mostrar la hora
        return `${hour}`;
      } else {
        // Si tiene minutos, mostrar la hora y los minutos
        return `${hour}:${minute}`;
      }
    });
  }  

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.actualizarTimeSlotsDelDia();
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
    console.log("Horario disponible:" + this.timeSlotsDelDia);
    this.highlightedCells = []; 
    this.showOptionsMenu=false;
  
    this.selectedCourt = court;
    this.selectedSlot = slot; 
  
    const slotIndex = this.timeSlotsDelDia.indexOf(slot);
    
    if (slotIndex !== -1) {
      // Verificar si la celda tiene conflicto de tiempo
      if (this.isNotEnoughTimeBetweenReservations(court.id, slot)) {
        // Si hay conflicto de tiempo, solo bloqueamos visualmente (no hacemos nada)
        return;
      }
  
      // Ahora calculamos las celdas hasta la hora de finalización
      const endTime = this.getEndTime(slot); // Obtener el tiempo de finalización
      let endSlotIndex = this.timeSlotsDelDia.indexOf(endTime);
  
      if (endSlotIndex !== -1) {
        // Resaltar todas las celdas entre start y end
        if (slotIndex == endSlotIndex){
          return
        }else{

          let cantidad_celdas_sin_rojo = 0;
          for (let i = slotIndex ; i <= endSlotIndex; i++) {
            if (this.isReserved(court.id, this.timeSlotsDelDia[i])!=='red') {
              cantidad_celdas_sin_rojo=cantidad_celdas_sin_rojo+1;
              if((cantidad_celdas_sin_rojo==4)){
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlotsDelDia[i-1] });
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlotsDelDia[i-2] });
                this.highlightedCells.push({ courtId: court.id, slot: this.timeSlotsDelDia[i-3] });
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

  get groupedHours(): string[] {
    const uniqueHours = new Set<string>();
    this.timeSlotsDelDia.forEach(slot => {
      const [hour] = slot.split(":");
      uniqueHours.add(hour + ":00");
    });
    return Array.from(uniqueHours);
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

  isFirstPastTime(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (!this.isPastTime(slot)) return false;
  
    // Si es la primera celda, y es pasada
    if (index === 0) return true;
  
    // Si la anterior no es pasada, esta es la primera pasada
    const previousSlot = this.timeSlotsDelDia[index - 1];
    return !this.isPastTime(previousSlot);
  }
  
  isLastPastTime(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (!this.isPastTime(slot)) return false;
  
    // Si es la última celda, y es pasada
    if (index === this.timeSlotsDelDia.length - 1) return true;
  
    // Si la siguiente no es pasada, esta es la última pasada
    const nextSlot = this.timeSlotsDelDia[index + 1];
    return !this.isPastTime(nextSlot);
  }
  
  isFirstHighlight(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (!this.isHighlighted(courtId, slot)) return false;
    if (index === 0) return true;
    const prev = this.timeSlotsDelDia[index - 1];
    return !this.isHighlighted(courtId, prev);
  }
  
  isLastHighlight(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (!this.isHighlighted(courtId, slot)) return false;
    if (index === this.timeSlotsDelDia.length - 1) return true;
    const next = this.timeSlotsDelDia[index + 1];
    return !this.isHighlighted(courtId, next);
  }
  
  isFirstReserved(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (this.isReserved(courtId, slot) !== 'red') return false;
    if (index === 0) return true;
    const prev = this.timeSlotsDelDia[index - 1];
    return this.isReserved(courtId, prev) !== 'red';
  }
  
  isLastReserved(courtId: number, slot: string): boolean {
    const index = this.timeSlotsDelDia.indexOf(slot);
    if (this.isReserved(courtId, slot) !== 'red') return false;
    if (index === this.timeSlotsDelDia.length - 1) return true;
    const next = this.timeSlotsDelDia[index + 1];
    return this.isReserved(courtId, next) !== 'red';
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
        if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
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
