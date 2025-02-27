package Grupo11.Seminario.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import Grupo11.Seminario.Entities.ConfiguracionGeneral;
import Grupo11.Seminario.Service.ConfiguracionGeneralService;
import Grupo11.Seminario.Service.RegistroService;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(path = "/configuracion_general")
public class ConfiguracionGeneralController {

    @Autowired
    private ConfiguracionGeneralService configuracion_general_service;
    @Autowired
    private RegistroService registro_service;
    @Autowired
    UsuarioService usuario_service;

    @GetMapping("/public/consultar_configuracion")
    public ResponseEntity<?> consultar_configuracion_general() {
        return ResponseEntity.ok().body(configuracion_general_service.get_configuracion_general());
    }

    @PutMapping("/public/actualizar_configuracion")
    public ResponseEntity<?> actualizar_configuracion_general(@RequestParam String email, @RequestBody ConfiguracionGeneral nueva_configuracion) {
        
        Integer id_duenio = usuario_service.buscar_usuario(email).get().getId();
        
        // Se verifica que exista el empleado con dicho Id
        if (registro_service.existe_empleado(id_duenio)){
            
            // Se verifica que el empleado sea un dueño
            if (registro_service.verificar_duenio(id_duenio)){
                return ResponseEntity.ok().body(configuracion_general_service.actualizar_configuracion_general(nueva_configuracion));
            }
            return ResponseEntity.badRequest().body("No tiene permisos para actualizar la configuracion general");
        }
        return ResponseEntity.badRequest().body("No esta registrado el empleado o no es un empleado");
    }
}

