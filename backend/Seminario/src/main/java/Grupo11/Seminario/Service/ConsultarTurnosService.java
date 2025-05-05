package Grupo11.Seminario.Service;

import java.util.List;
import java.util.Map;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;

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

    public List<Cancha> obtener_turnos_disponibles(TurnoDTO turnoDTO) {
        List<Cancha> canchasDisponibles = new ArrayList<>();
        List<Cancha> canchas = (List<Cancha>) i_cancha_repository.findAll();
        ConfiguracionGeneral configuracionGeneral = configuracion_general_service.get_configuracion_general();

        // Mapa para traducir los días en inglés a español
        Map<String, String> diasEnEspañol = new HashMap<>();
        diasEnEspañol.put("MONDAY", "lunes");
        diasEnEspañol.put("TUESDAY", "martes");
        diasEnEspañol.put("WEDNESDAY", "miércoles");
        diasEnEspañol.put("THURSDAY", "jueves");
        diasEnEspañol.put("FRIDAY", "viernes");
        diasEnEspañol.put("SATURDAY", "sábado");
        diasEnEspañol.put("SUNDAY", "domingo");

        // Obtener el día de la semana en inglés de la fecha deseada
        String diaEnIngles = turnoDTO.getFechaDeseada().getDayOfWeek().name();
        String diaEnEspañol = diasEnEspañol.get(diaEnIngles);

        // Obtener la configuración del día para el día específico (en español)
        DiaApertura diaConfig = configuracionGeneral.getDias_apertura().stream()
            .filter(d -> d.getDia().equalsIgnoreCase(diaEnEspañol))
            .findFirst()
            .orElse(null);

        if (diaConfig == null) {
            return canchasDisponibles; // Día cerrado, no hay disponibilidad
        }

        // Horarios de apertura y cierre del establecimiento
        LocalTime apertura = diaConfig.getHorario_inicio();
        LocalTime cierre = diaConfig.getHorario_fin();

        // Obtener el horario deseado del turno
        LocalTime horaInicioDeseada = turnoDTO.getHorario_deseado();
        LocalTime horaFinDeseada = horaInicioDeseada.plusMinutes(turnoDTO.getDuracion());

        // Verificar si el turno deseado entra dentro del horario de apertura y cierre
        if (horaInicioDeseada.isBefore(apertura) || horaFinDeseada.isAfter(cierre)) {
            return canchasDisponibles; // El turno no está dentro del horario de apertura/cierre
        }

        // Comprobar cada cancha para ver si el turno se puede reservar
        for (Cancha cancha : canchas) {
            List<Turno> turnosPorCancha = i_turno_repository
                .findTurnosFuturosPorCanchaJPQL(cancha.getId(), turnoDTO.getFechaDeseada(), apertura);

            boolean puedeReservar = true;

            if (turnosPorCancha.isEmpty()) {
                // Si no hay turnos existentes, se puede reservar si está dentro del horario permitido
                if (horaInicioDeseada.compareTo(apertura) >= 0 && horaFinDeseada.compareTo(cierre) <= 0) {
                    canchasDisponibles.add(cancha);
                }
                continue;
            }

            // Verificar si hay superposición con los turnos existentes
            for (Turno turno : turnosPorCancha) {
                LocalTime inicioExistente = turno.getHorarioInicio();
                LocalTime finExistente = turno.getHorarioFin();

                // Verificar si el turno deseado se superpone con alguno existente
                if (horaInicioDeseada.isBefore(finExistente) && horaFinDeseada.isAfter(inicioExistente)) {
                    puedeReservar = false; // Si se superpone, no se puede reservar
                    break;
                }
            }

            // Si no hay superposición, añadir la cancha a la lista de canchas disponibles
            if (puedeReservar) {
                canchasDisponibles.add(cancha);
            }
        }

        return canchasDisponibles;
    }  
}