package Grupo11.Seminario.Controller;

import Grupo11.Seminario.Service.EmpleadoService;
import Grupo11.Seminario.Service.JugadorService;
import Grupo11.Seminario.Service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/jugadores")
public class JugadorController {

    @Autowired
    private JugadorService jugadorService;
    @Autowired
    private EmpleadoService empleadoService;
    @Autowired
    UsuarioService usuarioService;

    // Asigna el rol de profesor a un jugador
    @PutMapping("/asignar_profesor/{jugador_id}")
    public ResponseEntity<String> asignarRolProfesor(@RequestParam String email ,@PathVariable Integer jugador_id) {
        Boolean exito = jugadorService.asignar_rol_profesor(jugador_id);

        Integer duenio_id = usuarioService.buscar_usuario(email).get().getId();
        if (empleadoService.existe_empleado(duenio_id)) {
            Boolean vduenio = empleadoService.verificar_duenio(duenio_id);
            if (vduenio) {
            
                if (exito) {
                    return ResponseEntity.ok("Rol de profesor asignado exitosamente al jugador.");
                } else {
                    return ResponseEntity.badRequest().body("Error al asignar el rol de profesor.");
                }
            }
            return ResponseEntity.badRequest().body("Error al verificar que se sea un dueño");   
        }
        return ResponseEntity.badRequest().body("El usuario no es un empleado");
    }

    // Asigna el rol de profesor a un jugador
    @PutMapping("/desasignar_profesor/{jugador_id}")
    public ResponseEntity<String> desasignarRolProfesor(@RequestParam String email ,@PathVariable Integer jugador_id) {
        Boolean exito = jugadorService.asignar_rol_profesor(jugador_id);

        Integer duenio_id = usuarioService.buscar_usuario(email).get().getId();
        if (empleadoService.existe_empleado(duenio_id)) {
            Boolean vduenio = empleadoService.verificar_duenio(duenio_id);
            if (vduenio) {
            
                if (exito) {
                    return ResponseEntity.ok("Rol de profesor asignado exitosamente al jugador.");
                } else {
                    return ResponseEntity.badRequest().body("Error al asignar el rol de profesor.");
                }
            }
            return ResponseEntity.badRequest().body("Error al verificar que se sea un dueño");   
        }
        return ResponseEntity.badRequest().body("El usuario no es un empleado");
    }
}

