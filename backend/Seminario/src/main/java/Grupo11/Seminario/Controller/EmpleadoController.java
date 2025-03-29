package Grupo11.Seminario.Controller;

import java.util.Optional;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Service.EmpleadoService;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping(path = "/private")
public class EmpleadoController {
    
    @Autowired
    EmpleadoService empleadoService;

    @GetMapping("/verificar/empleado")
    public ResponseEntity<Map<String, String>> verificarEmpleado(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");

        Optional<Empleado> empleado = empleadoService.buscarPorEmail(email);
    
        Map<String, String> response = new HashMap<>();
    
        if (empleado.isPresent()) {
            response.put("message", empleado.get().getDuenio() ? "duenio" : "empleado");
            return ResponseEntity.ok(response);
        }
    
        response.put("message", "no se encontro empleado");
        return ResponseEntity.badRequest().body(response);
    }

}
