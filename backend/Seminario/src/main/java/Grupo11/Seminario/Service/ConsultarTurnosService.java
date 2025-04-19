package Grupo11.Seminario.Service;

import java.util.List;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Grupo11.Seminario.DTO.TurnoDTO;
import Grupo11.Seminario.Entities.Cancha;
import Grupo11.Seminario.Entities.ConfiguracionGeneral;
import Grupo11.Seminario.Entities.DiaApertura;
import Grupo11.Seminario.Entities.Turno;
import Grupo11.Seminario.Repository.ICanchaRepository;
import Grupo11.Seminario.Repository.IDiaAperturaRepository;
import Grupo11.Seminario.Repository.ITurnoRepository;

@Service
@Transactional
public class ConsultarTurnosService {
    
    @Autowired
    ITurnoRepository i_turno_repository;
    @Autowired 
    ICanchaRepository i_cancha_repository;
    @Autowired
    IDiaAperturaRepository i_dia_apertura_repository;
    @Autowired
    ConfiguracionGeneralService configuracion_general_service;

    public List<TurnoDTO> obtener_turnos_ocupados(){
        List<TurnoDTO> turnosDTO = new ArrayList<>();
        List<Cancha> canchas = (List<Cancha>) i_cancha_repository.findAll();
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
        LocalDate fechaActual = LocalDate.now();
        LocalTime horaActual = LocalTime.now().withSecond(0).withNano(0);

        System.out.println("Fecha actual: " + fechaActual);
        System.out.println("Hora actual: " + horaActual);

        // Iteramos por cada cancha
        for (Cancha cancha: canchas){
            // Obtenemos los turnos por cada cancha, ordenados por fecha y por horario de inicio
            System.out.println("Buscando turnos a partir de " + fechaActual + " " + horaActual);
            List<Turno> turnos_por_cancha = i_turno_repository.
            findTurnosFuturosPorCanchaJPQL(cancha.getId(), fechaActual, horaActual);
            System.out.println("Lista de turnos: " + turnos_por_cancha);
            // Revisar los espacios entre turnos ocupados
            for (int i = 0; i < turnos_por_cancha.size(); i++) {
                Turno turno_actual = turnos_por_cancha.get(i);

                // Verificamos si el turno ya pasó (en la misma fecha y hora menor)
                if (turno_actual.getFecha().isEqual(fechaActual) && turno_actual.getHorarioInicio().isBefore(horaActual)) {
                    continue; // salteamos este turno
                }

                // Dia de la semana del turno
                String dia_de_semana = this.dia_espaniol(turno_actual.getFecha());

                DiaApertura dia_apertura = i_dia_apertura_repository.findByDia(dia_de_semana);

                // Difencia en minutos entre el turno y el horario de apertura
                long minutos_entre_apertura = Duration.between(dia_apertura.getHorario_inicio(), turno_actual.getHorarioInicio()).toMinutes();

                // Ver si hay un espacio estre el turno y el horario de apertura
                if ( minutos_entre_apertura>0 & minutos_entre_apertura<configuracion_general.getDuracion_minima_turno()) {
                    turnosDTO.add(new TurnoDTO(
                        cancha.getId(),
                        turno_actual.getFecha(),
                        dia_apertura.getHorario_inicio(),
                        turno_actual.getHorarioInicio()
                    ));
                }

                turnosDTO.add(new TurnoDTO(
                cancha.getId(),
                turno_actual.getFecha(),
                turno_actual.getHorarioInicio(),
                turno_actual.getHorario_fin()
                ));

                // Ver si hay un espacio entre este turno y el siguiente
                if (i < turnos_por_cancha.size() - 1) {
                    Turno siguiente_turno = turnos_por_cancha.get(i+1);
                    LocalTime fin_turno_actual = turno_actual.getHorario_fin();
                    LocalTime inicio_siguiente_turno = siguiente_turno.getHorarioInicio();

                    // Diferencia en minutos entre los dos turnos
                    long minutos_entre_turnos = Duration.between(fin_turno_actual, inicio_siguiente_turno).toMinutes();

                    if ( minutos_entre_turnos>0 & minutos_entre_turnos<configuracion_general.getDuracion_minima_turno()) {
                        turnosDTO.add(new TurnoDTO(
                            cancha.getId(),
                            turno_actual.getFecha(),
                            fin_turno_actual,
                            inicio_siguiente_turno
                        ));
                    }
                }

                // Difencia en minutos entre el turno y el horario de cierre
                long minutos_entre_cierre = Duration.between(turno_actual.getHorario_fin(), dia_apertura.getHorario_fin()).toMinutes();
                
                // Ver si hay un espacio estre el turno y el horario de cierre
                if (minutos_entre_cierre>0 & minutos_entre_cierre<configuracion_general.getDuracion_minima_turno()) {
                    turnosDTO.add(new TurnoDTO(
                        cancha.getId(),
                        turno_actual.getFecha(),
                        turno_actual.getHorario_fin(),
                        dia_apertura.getHorario_fin()
                    ));
                }
            }
        }
        return turnosDTO;
    }

    public String dia_espaniol(LocalDate fecha){
        // Dia de la semana del turno
        DayOfWeek numero_dia_semana = fecha.getDayOfWeek();
        String dia_de_semana="";
        switch (numero_dia_semana) {
            case MONDAY:
                return dia_de_semana = "Lunes";
            case TUESDAY:
                return dia_de_semana = "Martes";
            case WEDNESDAY:
                return dia_de_semana = "Miércoles";
            case THURSDAY:
                return dia_de_semana = "Jueves";
            case FRIDAY:
                return dia_de_semana = "Viernes";
            case SATURDAY:
                return dia_de_semana = "Sábado";
            case SUNDAY:
                return dia_de_semana = "Domingo";
            default:
                return dia_de_semana;
        }
    }
}
