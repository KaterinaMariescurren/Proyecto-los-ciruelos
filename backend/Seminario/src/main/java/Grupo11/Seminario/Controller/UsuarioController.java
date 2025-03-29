package Grupo11.Seminario.Controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Grupo11.Seminario.Service.UsuarioService;

@RestController
@RequestMapping(path = "/public/usuarios")
public class UsuarioController {

    @Autowired
    UsuarioService usuarioService;

    @GetMapping("/verificar-usuario/{email}")
    public ResponseEntity<?> verificarUsuario(@PathVariable String email) {
        Boolean existe = usuarioService.verificar_email(email);
        return ResponseEntity.ok(Map.of("registrado", existe));
    }
}
