import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService, Reserva, TurnoDTO } from '../../../api.service';

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
  selectedDate: string = new Date().toISOString().split('T')[0];
  minDate: string = this.getMinDate();
  currentHour: number = new Date().getHours();
  price: number = 15000;

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

  showOptionsMenu = false;
  optionsMenuPosition = { top: 0, left: 0 };
  highlightedCells: { courtId: number, slot: string }[] = [];
  halfHighlightedCell: { courtId: number, slot: string } | null = null;
  lastHighlightedCell: { courtId: number, slot: string } | null = null; // Nueva propiedad para la última celda resaltada

  selectedCourt: Court | null = null; // Guardar la cancha seleccionada
  selectedSlot: string | null = null; // Guardar el horario seleccionado

  constructor(
    private elementRef: ElementRef, 
    private authService: AuthService, 
    private toastrService: ToastrService,
    private api: ApiService,  
  ) {}

  ngOnInit() {
    this.cargarRerservaciones();
    console.log(this.reservations)
  }

  // Función que maneja el clic en el botón
  onButtonClick() {
    // Verificar si el usuario está logueado
    this.authService.authState$.subscribe(async (user) => {
      if (user) {

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

        (this.api.bloquearTurno(turnoDTO)).subscribe({
          next: (response) => {
            this.toastrService.success('Turno Bloqueado con exito', 'Reservar');
          }
        });
        // Aquí tu lógica para lo que ocurre al hacer clic si está logueado
      } else {
        // Si el usuario no está logueado, muestra un alert
        this.toastrService.info('Debes iniciar sesión para usar esta opción.', 'Reservar');
      }
    });
  }

  // Método para cargar los turnos desde el backend
  cargarRerservaciones() {
    this.api.getTurnos().subscribe(
      (turnos) => {
        this.reservations = turnos.map(turno => ({
          id_cancha: turno.id_cancha,
          horario_inicio_ocupado: turno.horario_inicio_ocupado,
          horario_fin_ocupado: turno.horario_fin_ocupado,
          fecha: turno.fecha
        }));
        console.log(this.reservations);  // Para verificar que los turnos se han cargado correctamente
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

  loadReservations(date: string) {
    this.reservations = this.reservations.filter(res => res.fecha === date);
  }  

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.loadReservations(this.selectedDate);
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
                if (duration < 90) {
                    return 'blue'; // Si la reserva es menor a 90 minutos, pintamos en azul
                }
                return 'red'; // Si está dentro del rango de la reserva y tiene 90 o más minutos, la celda es roja
            }
        }
    }

    return ''; // Si no está en ninguna reserva, no pintamos la celda
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
