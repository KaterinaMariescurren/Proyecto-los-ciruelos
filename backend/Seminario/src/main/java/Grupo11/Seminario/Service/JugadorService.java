package Grupo11.Seminario.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Repository.IJugadorRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class JugadorService {
    
    @Autowired
    private IJugadorRepository i_jugador_repository;


    public void guardar_jugador(Jugador jugador){
        i_jugador_repository.save(jugador);
    }

    public Jugador buscar_jugador(Integer id_jugador){
        return i_jugador_repository.findById(id_jugador).get();
    }

    public Boolean existe_jugador(Integer id_jugador){
        if (i_jugador_repository.findById(id_jugador).isEmpty()){
            return false;
        }
        return true;
    }

    // Asignar rol de profesor a un jugador
    public Boolean asignar_rol_profesor(Integer jugador_id) {
        Jugador jugador = i_jugador_repository.findById(jugador_id).orElse(null);
        if (jugador != null) {
            if (jugador.getProfesor()) {
                return false;
            }
            jugador.setProfesor(true);  // Asigna el rol de profesor
            i_jugador_repository.save(jugador);  // Actualiza la base de datos
            return true;
        }
        return false;
    }

    // Asignar rol de profesor a un jugador
    public Boolean desasignar_rol_profesor(Integer jugador_id) {
        Jugador jugador = i_jugador_repository.findById(jugador_id).orElse(null);
        if (jugador != null) {
            if (!jugador.getProfesor()) {
                return false;
            }
            jugador.setProfesor(false);  // Asigna el rol de profesor
            i_jugador_repository.save(jugador);  // Actualiza la base de datos
            return true;
        }
        return false;
    }
}
