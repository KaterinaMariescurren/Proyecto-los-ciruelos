package Grupo11.Seminario.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import Grupo11.Seminario.DTO.PagoMercadoPagoDTO;
import Grupo11.Seminario.Entities.Cancha;
import Grupo11.Seminario.Entities.ConfiguracionGeneral;
import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Entities.Jugador;
import Grupo11.Seminario.Entities.Reserva;
import Grupo11.Seminario.Repository.ICanchaRepository;
import Grupo11.Seminario.Repository.IReservaRepository;

@Service
@Transactional
public class ReservaService {
    
    @Autowired
    ICanchaRepository i_cancha_repository;
    @Autowired 
    IReservaRepository i_reserva_repository;
    @Autowired
    JugadorService jugador_service;
    @Autowired
    EmpleadoService empleado_service;
    @Autowired
    PagoService pago_service;
    @Autowired
    ConfiguracionGeneralService configuracion_general_service;


    public void guardar_reserva(Reserva reserva){
        i_reserva_repository.save(reserva);
    }

    public Optional<Reserva> buscar_reserva(Integer id_reserva){
        return i_reserva_repository.findById(id_reserva);
    }

    public List<Reserva> buscar_reservas(Integer jugador_id){
        return i_reserva_repository.findByJugadorId(jugador_id);
    }

    public Cancha buscar_cancha(Integer numero_cancha){
        return i_cancha_repository.findByNumero(numero_cancha).get();
    }

    // Se busca si existe el empleado
    public Boolean existe_empleado(Integer id_empleado){
        return empleado_service.existe_empleado(id_empleado);
    }

    // Se busca si existe el jugador
    public Boolean existe_jugador(Integer id_jugador){
        return jugador_service.existe_jugador(id_jugador);
    }

    //Se busca al jugador por su id
    public Jugador buscar_jugador(Integer id_jugador){
        return jugador_service.buscar_jugador(id_jugador);
    }

    //Se busca al empleado por su id
    public Empleado buscar_empleado(Integer id_empleado){
        return empleado_service.buscar_empleado(id_empleado);
    }

    public Boolean verificar_numero_cancha(Integer numero_cancha){
        if (i_cancha_repository.findByNumero(numero_cancha).isEmpty()){
            return false;
        }
        return true;
    }

    public Integer calcular_medias_horas(LocalTime horario_inicio, LocalTime horario_fin){
        long minutos = Duration.between(horario_inicio, horario_fin).toMinutes();
        Integer cant_medias_horas = (int) (minutos/30);
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
        if (cant_medias_horas == (configuracion_general.getDuracion_minima_turno() / 30)) {
            return 0;
        }
        return cant_medias_horas - (configuracion_general.getDuracion_minima_turno() / 30);
    }

    public Float calcular_precio_reserva(Integer cant_pelotas, Integer cant_paletas, Integer cant_medias_horas){
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
        return configuracion_general.getMonto_reserva() + 
        configuracion_general.getMonto_paletas() * cant_paletas + 
        configuracion_general.getMonto_pelotas() * cant_pelotas +
        configuracion_general.getMonto_x_media_hora() * cant_medias_horas;
    }

    public Float descuento(Boolean socio){
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
        if (socio) {
            return configuracion_general.getDescuento_socio();
        }
        return 0f;
    }

    public Float calcular_monto_pago(Float diferencia){
        ConfiguracionGeneral configuracion_general = configuracion_general_service.get_configuracion_general();
        return configuracion_general.getPorcentaje_seña() * diferencia;
    }

    public Boolean validar_pago(ResponseEntity<String> response) throws JsonMappingException, JsonProcessingException{
        return pago_service.validar_pago(response);
    }

    public PagoMercadoPagoDTO pagar(ResponseEntity<String> response) throws JsonMappingException, JsonProcessingException{
        return pago_service.pagar(response);
    }

    public ResponseEntity<String> buscar_pago(Long id_mp) throws JsonMappingException, JsonProcessingException{
        return pago_service.buscar_pago(id_mp);
    }

    public List<Reserva> buscarReservas(String email, String nombre, String apellido, LocalDate fecha) {
        if (email != null && !email.isEmpty()) {
            return i_reserva_repository.findByJugadorEmailOrderByFechaAsc(email);
        }
        if (nombre != null && !nombre.isEmpty()) {
            return i_reserva_repository.findByJugadorNombreOrderByFechaAsc(nombre);
        }
        if (apellido != null && !apellido.isEmpty()) {
            return i_reserva_repository.findByJugadorApellidoOrderByFechaAsc(apellido);
        }
        if (fecha != null) {
            return i_reserva_repository.findByFechaOrderByFechaAsc(fecha);
        }
        return i_reserva_repository.findAllByOrderByFechaAsc(); // Si no hay filtros, devuelve todas las reservas ordenadas
    }
}
