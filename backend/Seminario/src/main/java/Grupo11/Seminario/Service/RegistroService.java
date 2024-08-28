package Grupo11.Seminario.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Entities.Enum.Categoria;
import Grupo11.Seminario.Repository.IJugadorRepository;
import Grupo11.Seminario.Repository.IUsuarioRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class RegistroService {

    @Autowired
    IJugadorRepository i_jugador_repository;
    @Autowired
    IUsuarioRepository i_usuario_repository;

    // Se guarda el jugador en la BD
    public void guardar_jugador(Jugador jugador){
        i_jugador_repository.save(jugador);
    }

    public Boolean verificar_email(String email){
        return i_usuario_repository.findByEmail(email);
    }
}
