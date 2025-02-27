package Grupo11.Seminario.Controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import Grupo11.Seminario.DTO.AsociacionDTO;
import Grupo11.Seminario.DTO.PagoMercadoPagoDTO;
import Grupo11.Seminario.Entities.Asociacion;
import Grupo11.Seminario.Entities.ConfiguracionGeneral;
import Grupo11.Seminario.Entities.Cuenta;
import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Entities.Pago;
import Grupo11.Seminario.Service.AsociacionService;
import Grupo11.Seminario.Service.ConfiguracionGeneralService;
import Grupo11.Seminario.Service.PagoService;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(path = "/public")
public class AsociacionController {

    @Autowired
    AsociacionService asociacion_service;
    @Autowired
    PagoService pago_service;
    @Autowired
    ConfiguracionGeneralService configuracion_general_service;
    @Autowired
    UsuarioService usuarioService;
    
    @PutMapping(path = "/asociar_jugador")
    public ResponseEntity<?> asociar_jugador(@RequestParam String email , @RequestParam Integer id_jugador) throws JsonMappingException, JsonProcessingException{
    
        Integer id_duenio = usuarioService.buscar_usuario(email).get().getId();
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();

        // Se busca si existe el empleado
        if (asociacion_service.existe_empleado(id_duenio) ){

            // Se verifica que sea un dueño
            if (asociacion_service.verificar_duenio(id_duenio)) {

                if (asociacion_service.existe_jugador(id_jugador)) {
                    // Se verifica que el jugador no este asociado
                    if (asociacion_service.verificar_asociacion(id_jugador)) {
                        Jugador jugador = asociacion_service.buscar_jugador(id_jugador);
                        Empleado duenio = asociacion_service.buscar_empleado(id_duenio);
                        
                        Asociacion asociacion = new Asociacion();
                        asociacion.setFecha(LocalDate.now());
                        asociacion.setHora(LocalTime.now());
                        asociacion.setPrecio(configuracion_general.getMonto_asociacion());
    
                        jugador.setSocio(true);
                        asociacion.setJugador(jugador);
                        asociacion.setDuenio(duenio);

                        asociacion_service.guardar_asociacion(asociacion);
                        return ResponseEntity.ok().body("Asociacion Exitosa");
                    }
                    return ResponseEntity.badRequest().body("El jugador ya es un socio");
                }
                return ResponseEntity.badRequest().body("No existe el jugador");
            } 
            return ResponseEntity.badRequest().body("No tiene permisos para esta accion");  
        }
        return ResponseEntity.badRequest().body("No existe el empleado");
    }

    @PutMapping(path = "/asociarse")
    public ResponseEntity<Map<String, String>> asociarse(@RequestParam String email , @RequestParam Long id_mp) throws JsonMappingException, JsonProcessingException{
        Map<String, String> response2 = new HashMap<>();
        Integer id_jugador = usuarioService.buscar_usuario(email).get().getId();

        if (asociacion_service.existe_jugador(id_jugador)) {
            // Se verifica que el jugador no este asociado
            if (asociacion_service.verificar_asociacion(id_jugador)) {
                ResponseEntity<String> response = pago_service.buscar_pago(id_mp);

                // Se valida que este realizado el pago
                if (response.getStatusCode() == HttpStatus.OK) {
                    Jugador jugador = asociacion_service.buscar_jugador(id_jugador);
                    jugador.setSocio(true);

                    ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
                    PagoMercadoPagoDTO pago_mpDTO = pago_service.pagar(response);

                    Cuenta cuenta = new Cuenta();
                    cuenta.setEmail(pago_mpDTO.getEmail_pagador());
                    cuenta.setApellido(pago_mpDTO.getApellido_pagador());
                    cuenta.setNombre(pago_mpDTO.getNombre_pagador());
                    cuenta.setTipo_identificacion(pago_mpDTO.getTipo_identificacion());
                    cuenta.setNumero_identificacion(pago_mpDTO.getNumero_identificacion());

                    Pago pago = new Pago();
                    pago.setFecha(pago_mpDTO.getFecha());
                    pago.setHora(pago_mpDTO.getHora());
                    pago.setMetodo(pago_mpDTO.getMetodo_pago());
                    pago.setMotivo(pago_mpDTO.getMotivo());
                    pago.setEstado(pago_mpDTO.getEstado());
                    pago.setCuenta(cuenta);
                    pago.setMonto(configuracion_general.getMonto_asociacion());
                    pago.setDescuento(0f);

                    Asociacion asociacion = new Asociacion();
                    asociacion.setFecha(LocalDate.now());
                    asociacion.setHora(LocalTime.now());
                    asociacion.setPrecio(configuracion_general.getMonto_asociacion());

                    asociacion.setJugador(jugador);
                    asociacion.setDuenio(null);
                    asociacion.setPago(pago);

                    asociacion_service.guardar_asociacion(asociacion);
                    response2.put("message", "Asociacion Exitosa");  // Cambiado para enviar un JSON
                    return ResponseEntity.ok().body(response2);
                }   
                response2.put("message", "No se encontro el pago");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response2);
            }
            response2.put("message", "El jugador ya es un socio");
            return ResponseEntity.badRequest().body(response2);
        }
        response2.put("message", "No existe el jugador");
        return ResponseEntity.badRequest().body(response2);
    }
    
    @PutMapping(path = "/desasociarse")
    public ResponseEntity<?> desasociarse(@RequestParam String email) {
        Integer id_jugador = usuarioService.buscar_usuario(email).get().getId();

        if (asociacion_service.existe_jugador(id_jugador)) {
            // Verificar si el jugador está asociado
            if (!asociacion_service.verificar_asociacion(id_jugador)) {
                Jugador jugador = asociacion_service.buscar_jugador(id_jugador);
                jugador.setSocio(false);
                asociacion_service.guardar_jugador(jugador);
                return ResponseEntity.ok().body("Desasociado con éxito");
            }
            return ResponseEntity.badRequest().body("El jugador no está asociado");
        }
        return ResponseEntity.badRequest().body("No existe el jugador");
    }

    @PutMapping(path = "/desasociar_jugador")
    public ResponseEntity<?> desasociarse(@RequestParam String email , @RequestParam Integer id_jugador) {
        Integer id_duenio = usuarioService.buscar_usuario(email).get().getId();
        // Se busca si existe el empleado
        if (asociacion_service.existe_empleado(id_duenio) ){

            // Se verifica que sea un dueño
            if (asociacion_service.verificar_duenio(id_duenio)) {
                if (asociacion_service.existe_jugador(id_jugador)) {
                    // Verificar si el jugador está asociado
                    if (!asociacion_service.verificar_asociacion(id_jugador)) {
                        Jugador jugador = asociacion_service.buscar_jugador(id_jugador);
                        jugador.setSocio(false);
                        asociacion_service.guardar_jugador(jugador);
                        return ResponseEntity.ok().body("Desasociado con éxito");
                    }
                    return ResponseEntity.badRequest().body("El jugador no está asociado");
                }
                return ResponseEntity.badRequest().body("No existe el jugador");
            }
            return ResponseEntity.badRequest().body("No tiene los permisos para esta accion");
        }
        return ResponseEntity.badRequest().body("No se encontro el empleado");
    }
}

