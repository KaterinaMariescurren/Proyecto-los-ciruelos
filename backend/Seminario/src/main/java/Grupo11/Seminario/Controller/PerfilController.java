package Grupo11.Seminario.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import Grupo11.Seminario.DTO.EmpleadoDTO;
import Grupo11.Seminario.DTO.JugadorDTO;
import Grupo11.Seminario.DTO.UsuarioDTO;
import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Entities.Usuario;
import Grupo11.Seminario.Service.PerfilService;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(path = "/private")
public class PerfilController {

    @Autowired
    PerfilService perfil_service;
    @Autowired
    UsuarioService usuario_service;
    
    @GetMapping(path = "/consultar_perfil")
    public ResponseEntity<?> consultar_perfil(HttpServletRequest request){
        String email = (String) request.getAttribute("email");

        Integer id_usuario = usuario_service.buscar_usuario(email).get().getId();
        
        Empleado empleado = perfil_service.buscar_empleado(id_usuario);
        if (empleado==null) {
            Jugador jugador = perfil_service.buscar_jugador(id_usuario);
            JugadorDTO jugadorDTO = new JugadorDTO
                    (
                    jugador.getEmail(), jugador.getNombre(), jugador.getApellido(),
                    jugador.getCategoria().toString(), jugador.getTelefonos()
                    );
            jugadorDTO.setProfesor(jugador.getProfesor());
            jugadorDTO.setSocio(jugador.getSocio());
            return ResponseEntity.ok().body(jugadorDTO);
        }
        EmpleadoDTO empleadoDTO = new EmpleadoDTO
                    (
                    empleado.getEmail(), empleado.getNombre(), empleado.getApellido(),
                    empleado.getDuenio(), empleado.getTelefonos()
                    );
        return ResponseEntity.ok().body(empleadoDTO);
    }

    @PutMapping(path = "/modificar_perfil")
    public ResponseEntity<?> modificar_perfil(HttpServletRequest request, @RequestBody UsuarioDTO usuarioDTO){
        String email = (String) request.getAttribute("email");

        Optional<Usuario> usuario = usuario_service.buscar_usuario(email);
        Integer id_usuario=usuario.get().getId();
        
        Empleado empleado = perfil_service.buscar_empleado(id_usuario);
        if (empleado==null) {
            Jugador jugador = perfil_service.buscar_jugador(id_usuario);
            jugador.setNombre(usuarioDTO.getNombre());
            jugador.setApellido(usuarioDTO.getApellido());
                    
            jugador.getTelefonos().clear();
            jugador.getTelefonos().addAll(usuarioDTO.getTelefonos());

            if (!usuarioDTO.getCategoria().isEmpty()) {
                jugador.setCategoria(perfil_service.verificar_categoria(usuarioDTO.getCategoria()));
            }

            perfil_service.guardar_jugador(jugador);
            return ResponseEntity.ok().body("Se actualizo el perfil");
        }
        empleado.setNombre(usuarioDTO.getNombre());
        empleado.setApellido(usuarioDTO.getApellido());

        empleado.getTelefonos().clear();
        empleado.getTelefonos().addAll(usuarioDTO.getTelefonos());
                
        perfil_service.guardar_empleado(empleado);
        return ResponseEntity.ok().body("Se actualizo el perfil"); 
    }
}
