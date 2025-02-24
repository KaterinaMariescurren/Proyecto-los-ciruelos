package Grupo11.Seminario.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import Grupo11.Seminario.Entities.ConfiguracionGeneral;
import Grupo11.Seminario.Entities.DiaApertura;
import Grupo11.Seminario.Repository.IConfiguracionGeneral;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ConfiguracionGeneralService {
    
    @Autowired
    IConfiguracionGeneral i_configuracion_general;

    ConfiguracionGeneral configuracion_general;

    @PostConstruct
    public void init() {
        // Se setea la configuracion con la configuracion de la BD 
        // sino existe se crea con valores por default
        this.configuracion_general = i_configuracion_general.findById(1).orElseGet(() -> {
            ConfiguracionGeneral config = new ConfiguracionGeneral();

            // Se setean todos los precios
            config.setDescuento_socio(0.1f);
            config.setMonto_paletas(1000.0f);
            config.setMonto_pelotas(1800.0f);
            config.setMonto_reserva(15000.0f);
            config.setMonto_asociacion(10000.0f);
            config.setMonto_x_media_hora(5000f);
            config.setPorcentaje_seña(0.25f);
            config.setStock_pelota(100);
            config.setStock_paleta(50);
            
            // Se setean todas las horas
            LocalTime hora_inicio_pico = LocalTime.of(12, 0);
            LocalTime hora_fin_pico = LocalTime.of(16, 0);
            config.setHorario_inicio_pico(hora_inicio_pico);
            config.setHorario_fin_pico(hora_fin_pico);

            //Se setea la duracion minima del turno
            config.setDuracion_minima_turno(90);

            // Se setea la duracion maxima del turno
            config.setDuracion_maxima_turno(config.getDuracion_minima_turno() * 2);

            List<DiaApertura> dia_aperturas = new ArrayList<>();

            String[] diasSemana = {"Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"};

            // Horarios de apertura
            LocalTime hora_inicio = LocalTime.of(8, 0);
            LocalTime hora_fin = LocalTime.of(22, 0);

            // Añadimos los días con los horarios correspondientes
            for (String dia : diasSemana) {
                DiaApertura dia_apertura = new DiaApertura();
                dia_apertura.setDia(dia);
                dia_apertura.setHorario_inicio(hora_inicio);
                dia_apertura.setHorario_fin(hora_fin);
                dia_aperturas.add(dia_apertura);
            }

            config.setDias_apertura(dia_aperturas);

            // Se guarda la configuracion general
            return i_configuracion_general.save(config);
        });
    }

    public ConfiguracionGeneral get_configuracion_general() {
        return this.configuracion_general;
    }

    public ConfiguracionGeneral actualizar_configuracion_general(ConfiguracionGeneral nueva_configuracion) {
        // Se setean todos los precios
        this.configuracion_general.setDescuento_socio(nueva_configuracion.getDescuento_socio());
        this.configuracion_general.setMonto_paletas(nueva_configuracion.getMonto_paletas());
        this.configuracion_general.setMonto_pelotas(nueva_configuracion.getMonto_pelotas());
        this.configuracion_general.setMonto_reserva(nueva_configuracion.getMonto_reserva());
        this.configuracion_general.setMonto_x_media_hora(nueva_configuracion.getMonto_x_media_hora());
        this.configuracion_general.setMonto_asociacion(nueva_configuracion.getMonto_asociacion());
        this.configuracion_general.setPorcentaje_seña(nueva_configuracion.getPorcentaje_seña());
        this.configuracion_general.setStock_pelota(nueva_configuracion.getStock_pelota());
        this.configuracion_general.setStock_paleta(nueva_configuracion.getStock_paleta());
            
        // Se setean todas las horas
        this.configuracion_general.setHorario_inicio_pico(nueva_configuracion.getHorario_inicio_pico());
        this.configuracion_general.setHorario_fin_pico(nueva_configuracion.getHorario_fin_pico());

        // Se setea la duracion minima del turno
        this.configuracion_general.setDuracion_minima_turno(nueva_configuracion.getDuracion_minima_turno());

        // Se setea la duracion maxima del turno
        this.configuracion_general.setDuracion_maxima_turno(this.configuracion_general.getDuracion_minima_turno()*2);

        // Eliminar los días de apertura existentes
        if (this.configuracion_general.getDias_apertura() != null) {
            this.configuracion_general.getDias_apertura().clear();
        }

        // Agregar los nuevos días de apertura
        List<DiaApertura> dias_apertura_nuevos = nueva_configuracion.getDias_apertura();
        if (dias_apertura_nuevos != null) {
            this.configuracion_general.setDias_apertura(dias_apertura_nuevos);
        }

        // Se guarda la configuracion general
        i_configuracion_general.save(this.configuracion_general);
        this.configuracion_general = i_configuracion_general.findById(1).get();

        return this.configuracion_general;
    }
}
