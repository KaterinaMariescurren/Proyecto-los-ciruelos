package Grupo11.Seminario.Service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Grupo11.Seminario.Entities.Usuario;
import Grupo11.Seminario.Repository.IUsuarioRepository;

@Service
@Transactional
public class UsuarioService {

    @Autowired
    IUsuarioRepository i_usuario_repository;
    
    public Optional<Usuario> buscar_usuario(String email){
        return i_usuario_repository.findByEmail(email);
    }

    public Boolean verificar_email(String email){
        return i_usuario_repository.findByEmail(email).isPresent();
    }
}
