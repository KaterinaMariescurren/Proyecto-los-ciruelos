package Grupo11.Seminario.Controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import Grupo11.Seminario.DTO.EmpleadoDTO;
import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Entities.Usuario;
import Grupo11.Seminario.Service.RegistroService;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/public/")
public class RegistroPrivadoController {
    
    @Autowired
    RegistroService registro_service;
    @Autowired
    UsuarioService usuarioService;

    // Controlador privado para registrar a un empleado en la aplicacion
    @PostMapping(path = "/registro/empleado")
    public ResponseEntity<?> registro_empleado(@RequestParam String email , @RequestBody EmpleadoDTO empleadoDTO){
    
        Optional<Usuario> usuario = usuarioService.buscar_usuario(email);
        Integer id_duenio = usuario.get().getId();

        // Se busca si existe el empleado
        if (registro_service.existe_empleado(id_duenio)){
        
            // Verificar que el que hace la peticion sea Duenio
            if (registro_service.verificar_duenio(id_duenio)){
                // Verifica que el mail no este registrado
                if (registro_service.verificar_email(empleadoDTO.getEmail())){
                    Empleado empleado = new Empleado();
                    empleado.setEmail(empleadoDTO.getEmail());
                    empleado.setNombre(empleadoDTO.getNombre());
                    empleado.setApellido(empleadoDTO.getApellido());

                    empleado.setTelefonos(empleadoDTO.getTelefonos());
                    empleado.setDuenio(empleadoDTO.getDuenio());

                    registro_service.guardar_empleado(empleado);

                    EmpleadoDTO empleadoDTO_frontend = new EmpleadoDTO
                        (empleado.getEmail(), empleado.getNombre(), empleado.getApellido(), 
                        empleado.getDuenio(), empleado.getTelefonos()
                        );

                    // Le devolvemos los datos del empleado o duenio al FrontEnd
                    return ResponseEntity.ok(empleadoDTO_frontend);
                }
                return ResponseEntity.badRequest().body("El mail ya esta registrado");
            }
            return ResponseEntity.badRequest().body("No tiene permisos para crear un empleado");
        }
        return ResponseEntity.badRequest().body("No esta registrado el dueño");
    }
}
