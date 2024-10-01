package Grupo11.Seminario.Entities;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Turno {
    
    // Se define el ID como autoincremental
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, name = "fecha")
    private LocalDate fecha;

    @Column(nullable = false, name = "horario_inicio")
    private LocalTime horario_inicio;

    @Column(nullable = false, name = "horario_fin")
    private LocalTime horario_fin;

    // Faltaria el Estado

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(nullable = false, name = "cancha_id")
    private Cancha cancha;
}
