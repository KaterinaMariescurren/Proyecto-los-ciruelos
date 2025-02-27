package Grupo11.Seminario.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Grupo11.Seminario.Entities.Empleado;
import Grupo11.Seminario.Repository.IEmpleadoRepository;
import java.util.Optional;

@Service
@Transactional
public class EmpleadoService {
    
    @Autowired
    IEmpleadoRepository i_empleado_repository;

    public void guardar_empleado(Empleado empleado){
        i_empleado_repository.save(empleado);
    }

    public Empleado buscar_empleado(Integer id_empleado){
        return i_empleado_repository.findById(id_empleado).get();
    }

    public Boolean existe_empleado(Integer id_empleado){
        if (i_empleado_repository.findById(id_empleado).isEmpty()){
            return false;
        }
        return true;
    }

    public Boolean verificar_duenio(Integer id_empleado){
        return i_empleado_repository.findById(id_empleado).get().getDuenio();
    }

    public Optional<Empleado> buscarPorEmail(String email) {
        return i_empleado_repository.findByEmail(email).stream().findFirst();
    }
}
