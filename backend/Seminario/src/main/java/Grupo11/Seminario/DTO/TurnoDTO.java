package Grupo11.Seminario.DTO;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Data;

@Data
public class TurnoDTO {
    
    private Integer id_cancha;
    private LocalDate fechaDeseada;
    private LocalTime horario_deseado;
    private Integer duracion;

    public TurnoDTO(
        Integer id_cancha, LocalDate fechaDeseada, LocalTime horario_deseado, Integer duracion) {
        this.id_cancha = id_cancha;
        this.fechaDeseada = fechaDeseada;
        this.horario_deseado = horario_deseado;
        this.duracion = duracion;
    }
}
