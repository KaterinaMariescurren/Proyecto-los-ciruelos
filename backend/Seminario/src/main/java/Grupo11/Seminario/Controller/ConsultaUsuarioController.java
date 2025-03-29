package Grupo11.Seminario.Controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import Grupo11.Seminario.Service.ConsultaUsuarioService;
import Grupo11.Seminario.Service.UsuarioService;

@RestController
@RequestMapping(path = "/public/consultar")
public class ConsultaUsuarioController {

    @Autowired
    private ConsultaUsuarioService consultaUsuarioService;
    @Autowired
    UsuarioService usuarioService;

    // Endpoint para buscar usuarios y devolver DTOs
    @GetMapping("/usuarios/buscar")
    public ResponseEntity<?> buscar_usuarios(
        @RequestParam Optional<String> nombre,
        @RequestParam Optional<String> apellido,
        @RequestParam Optional<String> email,
        @RequestParam String email_usuario
    ) {
    
        Integer id_empleado = usuarioService.buscar_usuario(email_usuario).get().getId();

        if (consultaUsuarioService.existe_empleado(id_empleado)) {
            List<Object> usuarios = consultaUsuarioService.buscar_usuarios(nombre, apellido, email);
            return ResponseEntity.ok(usuarios);
        }
        return ResponseEntity.badRequest().body("No tiene permisos para realizar esta accion");
    }

    @GetMapping("/usuarios/buscar_profesor")
    public ResponseEntity<?> buscar_profesores(
        @RequestParam Optional<String> nombre,
        @RequestParam Optional<String> apellido,
        @RequestParam Optional<String> email
    ) {
        List<Object> profesores = consultaUsuarioService.buscar_profesores(nombre, apellido, email);
        System.out.println("MANDANDO PROFESORES");
        return ResponseEntity.ok(profesores);
    }
}
