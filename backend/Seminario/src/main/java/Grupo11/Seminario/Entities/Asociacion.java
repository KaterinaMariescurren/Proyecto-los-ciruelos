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
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "asociacion")
@Data
@NoArgsConstructor
public class Asociacion {
    
    // Se define el ID como autoincremental
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, name = "fecha")
    private LocalDate fecha;

    @Column(nullable = false, name = "hora")
    private LocalTime hora;

    @Column(nullable = false, name = "precio")
    private Float precio;

    @ManyToOne
    @JoinColumn(nullable = false, name = "jugador_id")
    private Jugador jugador;

    @ManyToOne
    @JoinColumn(nullable = true, name = "empleado_id")
    private Empleado duenio;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(nullable = true, name = "pago_id")
    private Pago pago;
}
