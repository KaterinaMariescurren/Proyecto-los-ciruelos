package Grupo11.Seminario.Repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import Grupo11.Seminario.Entities.Reserva;

@Repository
public interface IReservaRepository extends CrudRepository<Reserva, Integer> {
    
    // Método para buscar reservas por el ID del jugador
    List<Reserva> findByJugadorId(Integer jugadorId);

    // Traer todas las reservas ordenadas por fecha
    List<Reserva> findAllByOrderByFechaAsc();

    // Buscar reservas por email del jugador ordenadas por fecha
    List<Reserva> findByJugadorEmailOrderByFechaAsc(String email);

    // Buscar reservas por nombre del jugador ordenadas por fecha
    List<Reserva> findByJugadorNombreOrderByFechaAsc(String nombre);

    // Buscar reservas por apellido del jugador ordenadas por fecha
    List<Reserva> findByJugadorApellidoOrderByFechaAsc(String apellido);

    // Buscar reservas por fecha específica
    List<Reserva> findByFechaOrderByFechaAsc(LocalDate fecha);
}

