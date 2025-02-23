package Grupo11.Seminario.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Service.EmpleadoService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping(path = "/public")
public class EmpleadoController {
    
    @Autowired
    EmpleadoService empleadoService;

    @GetMapping("/verificar/empleado")
    public ResponseEntity<String> verificarEmpleado(@RequestParam String email) {
        Optional<Empleado> empleado = empleadoService.buscarPorEmail(email);

        if (empleado.isPresent()) {
            return ResponseEntity.ok(empleado.get().getDuenio() ? "duenio" : "empleado");
        }

        return ResponseEntity.badRequest().body("no se encontro el empleado");
    }
}
