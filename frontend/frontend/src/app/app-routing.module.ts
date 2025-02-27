// Angular Core & Routing
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards (Autenticación y Roles)
import { authGuard } from './auth/auth.guard'; 
import { noAuthGuard } from './auth/no-auth.guard';
import { roleGuard } from './auth/role.guard';

// Componentes de páginas generales
import { HomeComponent } from './components/home/home.component';
import { BeneficiosSociosComponent } from './components/beneficios-socios/beneficios-socios.component';
import { ProfesoresComponent } from './components/shared/profesores/profesores.component';

// Componentes de autenticación
import { LoginComponent } from './components/shared/login/login.component';
import { CambiarContraseniaComponent } from './components/shared/login/cambiar_contrasenia/cambiar-contrasenia.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { PostRegisterComponent } from './components/shared/register/postregister/postregister.component';
import { ReestablecerContraseniaComponent } from './components/shared/reestablecer_contrasenia/reestalecer_contrasenia.component';
import { VerificarCorreoComponent } from './components/shared/verificar-correo/verificar-correo.component';

// Componentes de usuario autenticado
import { PerfilComponent } from './components/shared/perfil/perfil.component';
import { MisReservasComponent } from './components/shared/mis-reservas/mis-reservas.component';
import { TicketComponent } from './components/shared/ticket/ticket.component';
import { ReservaComponent } from './components/shared/reserva/reserva.component';
import { ProcesarPagoComponent } from './components/shared/procesar-pago/procesar-pago.component';
import { MercadopagoComponent } from './components/shared/mercadopago/mercadopago.component';

// Componentes exclusivos para administradores
import { ConsultarReservasComponent } from './components/shared/consultar_reservas/consultar_reservas.component';
import { ConsultarUsuariosComponent } from './components/shared/consultar_usuarios/consultar_usuarios.component';
import { ModificarValoresComponent } from './components/shared/modificar_valores/modificar_valores.component';
import { CalendarioReservaComponent } from './components/shared/calendario_reserva/calendario_reserva.component';
import { RegisterEmpleadoComponent } from './components/shared/register-empleado/register-empleado.component';
import { ConsultarEmpleadoComponent } from './components/shared/consultar-empleado/consultar-empleado.component';
import { ReservasDuenioComponent } from './components/shared/reservas-duenio/reservas-duenio.component';


const routes: Routes = [
//--------------------- Rutas publicas (sin autenticacion) ------------------------------------------------
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'cambiar-contrasenia', component: CambiarContraseniaComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'postregister', component: PostRegisterComponent, canActivate: [noAuthGuard] },
  { path: 'reestablecer-contrasenia', component: ReestablecerContraseniaComponent, canActivate: [noAuthGuard] },
  { path: 'verificar-correo', component: VerificarCorreoComponent, canActivate: [noAuthGuard] },
  { path: 'profesores', component: ProfesoresComponent }, 
  { path: 'beneficios', component: BeneficiosSociosComponent },
  { path: 'calendario', component: ReservasDuenioComponent},

//--------------------- Rutas protegida (con autenticacion) ------------------------------------------------
  { path: 'mercadopago', component: MercadopagoComponent, canActivate: [authGuard] },
  { path: 'ticket', component: TicketComponent, canActivate: [authGuard] },
  { path: 'reserva', component: ReservaComponent, canActivate: [authGuard] },
  { path: 'procesar-pago', component: ProcesarPagoComponent, canActivate: [authGuard] },
  { path: 'mis-reservas', component: MisReservasComponent, canActivate: [authGuard]  },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard]  }, 
  { path: 'register-empleado', component: RegisterEmpleadoComponent, canActivate: [authGuard] },

//--------------------- Rutas protegida (SOLO administrador) ------------------------------------------------
  { path: 'consultar_reservas', component: ConsultarReservasComponent },
  { path: 'consultar_usuarios', component: ConsultarUsuariosComponent  },
  { path: 'modificar_valores', component: ModificarValoresComponent },
  { path: 'consultar-empleado', component: ConsultarEmpleadoComponent },
  { path: 'register-jugador', component: RegisterComponent}, 

  // , canActivate: [roleGuard], data: { role: 'duenio' }

//--------------------- Redirección en caso de rutas inválidas ------------------------------------------------
  { path: '**', redirectTo: 'home' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
