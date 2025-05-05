package Grupo11.Seminario.Controller;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import Grupo11.Seminario.DTO.JugadorDTO;
import Grupo11.Seminario.DTO.TurnoDTO;
import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Entities.Turno;
import Grupo11.Seminario.Entities.Enum.EstadoTurno;
import Grupo11.Seminario.Service.RegistroService;
import Grupo11.Seminario.Service.ReservaService;
import Grupo11.Seminario.Service.TurnoService;

@RestController
@RequestMapping(path = "/public/")
public class RegistroPublicoController {
    
    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    RegistroService registro_service;
    @Autowired
    ReservaService reserva_service;
    @Autowired
    TurnoService turnoService;

    @PutMapping(path = "/bloquear/turno")
    ResponseEntity<Map<String, String>> bloquear_turno( @RequestBody TurnoDTO turnoDTO){

        Turno turno = new Turno();
        turno.setCancha(reserva_service.buscar_cancha(turnoDTO.getId_cancha()));
        turno.setFecha(turnoDTO.getFechaDeseada());
        turno.setHorarioInicio(turnoDTO.getHorario_deseado());
        turno.setHorarioFin(turnoDTO.getHorario_deseado().plusMinutes(turnoDTO.getDuracion()));
        turno.setEstado(EstadoTurno.Bloqueado);
        turno.setHorarioBloqueo(LocalTime.now());
        turnoService.guardar_turno(turno);
        // Responder con un JSON que contenga un mensaje
        Map<String, String> response = new HashMap<>();
        response.put("message", "Se bloqueo el turno");
        return ResponseEntity.ok(response);
    }

    @PostMapping(path = "/registro/jugador")
    public ResponseEntity<?> registroJugador(@RequestBody JugadorDTO jugadorDTO, @RequestParam(required = false) String password) {
        // Verifica si el correo ya está registrado en la base de datos
        if (registro_service.verificar_email(jugadorDTO.getEmail())) {
            try {
                Jugador jugador = new Jugador();
                jugador.setEmail(jugadorDTO.getEmail());
                jugador.setNombre(jugadorDTO.getNombre());
                jugador.setApellido(jugadorDTO.getApellido());
                jugador.setCategoria(registro_service.verificar_categoria(jugadorDTO.getCategoria()));
                jugador.setTelefonos(jugadorDTO.getTelefonos());
    
                // Si la contraseña se envió, se registra en Firebase
                if (password != null && !password.isEmpty()) {
                    UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                            .setEmail(jugadorDTO.getEmail())
                            .setEmailVerified(false) // El correo no está verificado aún
                            .setPassword(password)
                            .setDisplayName(jugadorDTO.getNombre() + " " + jugadorDTO.getApellido());
    
                    // Crear usuario en Firebase
                    firebaseAuth.createUser(request);  
                }

                // Guardar el jugador en la base de datos
                registro_service.guardar_jugador(jugador);
    
                // Devolver los datos del jugador como respuesta
                JugadorDTO jugadorDTOFront = new JugadorDTO(
                        jugador.getEmail(), jugador.getNombre(), jugador.getApellido(),
                        jugador.getCategoria().toString(), jugador.getTelefonos()
                );
    
                return ResponseEntity.ok(jugadorDTOFront);
    
            } catch (Exception e) {
                return ResponseEntity.status(500).body("Error al registrar usuario: " + e.getMessage());
            }
        }
    
        return ResponseEntity.badRequest().body("El email ya está registrado");
    }    
}
