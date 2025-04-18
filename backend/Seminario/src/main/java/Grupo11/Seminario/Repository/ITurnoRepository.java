package Grupo11.Seminario.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;

import Grupo11.Seminario.Entities.Cancha;
import Grupo11.Seminario.Entities.Turno;
import Grupo11.Seminario.Entities.Enum.EstadoTurno;

@Repository
public interface ITurnoRepository extends CrudRepository<Turno,Integer> {
    
    public List<Turno> findByCanchaOrderByFechaAscHorarioInicioAsc(Cancha cancha);

    // Método para encontrar turnos de una cancha desde la fecha actual en adelante
    @Query("SELECT t FROM Turno t WHERE t.cancha = :cancha AND " +
        "(t.fecha > :fechaActual OR (t.fecha = :fechaActual AND t.horarioInicio > :horaActual)) " +
        "ORDER BY t.fecha ASC, t.horarioInicio ASC")
    List<Turno> findTurnosFuturosPorCancha(
        @Param("cancha") Cancha cancha,
        @Param("fechaActual") LocalDate fechaActual,
        @Param("horaActual") LocalTime horaActual
    );    
    
    // Traes todos los turnos bloqueados hace un tiempo especifico
    public List<Turno> findByEstadoAndHorarioBloqueoBefore(EstadoTurno estado, LocalTime horario_bloqueo);
}
