package Grupo11.Seminario.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Grupo11.Seminario.DTO.TurnoDTO;
import Grupo11.Seminario.Entities.Cancha;
import Grupo11.Seminario.Service.ConsultarTurnosService;

@RestController
@RequestMapping(path = "/public")
public class ConsultarTurnosController {

    @Autowired
    ConsultarTurnosService consultar_turnos_service;
    
    @PostMapping(path = "/consultar_turnos")
    public ResponseEntity<List<Cancha>> obtener_turnos_disponibles(@RequestBody TurnoDTO turnoDTO){
        return ResponseEntity.ok().body(consultar_turnos_service.obtener_turnos_disponibles(turnoDTO));

    }
}
