import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox'
import { ToastrModule } from 'ngx-toastr';

// Importaciones de Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

// Components
import { AppComponent } from './app.component';
import { MercadopagoComponent } from './components/shared/mercadopago/mercadopago.component';
import { CambiarContraseniaComponent } from './components/shared/login/cambiar_contrasenia/cambiar-contrasenia.component';
import { LoginComponent } from './components/shared/login/login.component';
import { RegisterComponent } from './components/shared/register/register.component';
import { ButtonProviders } from './components/shared/login/cambiar_contrasenia/button_provider/button_providers.component'
import { HomeComponent } from './components/home/home.component';
import { CalendarioReservaComponent } from './components/shared/calendario_reserva/calendario_reserva.component';
import { PostRegisterComponent } from './components/shared/register/postregister/postregister.component';
import { ReestablecerContraseniaComponent } from './components/shared/reestablecer_contrasenia/reestalecer_contrasenia.component'; 
import { VerificarCorreoComponent } from './components/shared/verificar-correo/verificar-correo.component';
import { BeneficiosSociosComponent } from './components/beneficios-socios/beneficios-socios.component';
import { AsociarComponent } from './components/beneficios-socios/asociar/asociar.component';
import { DesasociarComponent } from './components/beneficios-socios/desasociar/desasociar.component'; 
import { NavbarComponent } from './components/navbar/navbar.component';
import { PerfilComponent } from './components/shared/perfil/perfil.component';
import { TicketComponent } from './components/shared/ticket/ticket.component';
import { ReservaComponent } from './components/shared/reserva/reserva.component';
import { ProcesarPagoComponent } from './components/shared/procesar-pago/procesar-pago.component';
import { MisReservasComponent } from './components/shared/mis-reservas/mis-reservas.component';
import { ProfesoresComponent } from './components/shared/profesores/profesores.component';
import { ConsultarReservasComponent } from './components/shared/consultar_reservas/consultar_reservas.component';
import { ConsultarUsuariosComponent } from './components/shared/consultar_usuarios/consultar_usuarios.component';
import { ModificarValoresComponent } from './components/shared/modificar_valores/modificar_valores.component';
import { RegisterEmpleadoComponent } from './components/shared/register-empleado/register-empleado.component';
import { ConsultarEmpleadoComponent } from './components/shared/consultar-empleado/consultar-empleado.component';

// Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../environments/environment';
import { ReservasDuenioComponent } from './components/shared/reservas-duenio/reservas-duenio.component';



@NgModule({
  declarations: [
    AppComponent,
    MercadopagoComponent,
    CambiarContraseniaComponent,
    LoginComponent,
    RegisterComponent,
    ButtonProviders,
    CalendarioReservaComponent,
    HomeComponent,
    PostRegisterComponent,
    ReestablecerContraseniaComponent,
    VerificarCorreoComponent,
    NavbarComponent,
    PerfilComponent,
    TicketComponent,
    ReservaComponent,
    BeneficiosSociosComponent,
    AsociarComponent,
    DesasociarComponent,
    ProcesarPagoComponent,
    MisReservasComponent,
    ProfesoresComponent,
    ConsultarReservasComponent,
    ConsultarUsuariosComponent,
    ModificarValoresComponent,
    RegisterEmpleadoComponent,
    ConsultarEmpleadoComponent,
    ReservasDuenioComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatTableModule,
    MatSelectModule,
    NgOptimizedImage,
    MatCheckboxModule,
    BrowserAnimationsModule, // Asegúrate de importar esto
    ToastrModule.forRoot({
      positionClass: 'toast-top-right', // Coloca la notificación arriba a la derecha
      timeOut: 3000, // Duración en milisegundos
      closeButton: true, // Muestra un botón de cierre
      progressBar: true, // Muestra una barra de progreso
      enableHtml: true
    }),  
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig), // Asegúrate de importar esto
  ],
  providers: [
    provideFirebaseApp(() => initializeApp({"projectId":"proyecto-los-ciruelos","appId":"1:458631280275:web:077d19f3d31ac919ca3f66","storageBucket":"proyecto-los-ciruelos.appspot.com","apiKey":"AIzaSyADexIDOi159hPk8yHrKvBrh8n8OeY5Cpo","authDomain":"proyecto-los-ciruelos.firebaseapp.com","messagingSenderId":"458631280275","measurementId":"G-K0V8KZ571Q"})),
    provideAuth(() => getAuth()),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
