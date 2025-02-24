import { Injectable, inject } from '@angular/core';
import {
  Auth,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
} from '@angular/fire/auth';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { applyActionCode, getAuth, getRedirectResult, onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth';
import { HttpClient, HttpParams } from '@angular/common/http';  // Importamos HttpClient para las solicitudes HTTP

export interface Credential {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  private user: User | null = null;
  readonly authState$: Observable<User | null> = authState(this.auth);
  private http: HttpClient = inject(HttpClient); // Inyectamos HttpClient

  constructor(private fb: FormBuilder, private toastrService: ToastrService) {
    onAuthStateChanged(this.auth, (user) => {
      this.user = user; // Actualiza el estado del usuario
    });
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');  // Verifica si el usuario está en localStorage
  }

  // Método para hacer logout
  logout(): Promise<void> {
    return signOut(this.auth)
      .then(() => {
        localStorage.removeItem('user'); // Elimina el usuario de localStorage al cerrar sesión
        this.router.navigate(['/home'], { queryParams: {}, replaceUrl: true }); // Elimina los queryParams
      })
      .catch((error) => {
        console.error('Error al cerrar sesión', error);
        this.toastrService.error('Hubo un error al cerrar sesión', 'Error');
        throw error;  // Lanza error si ocurre algún problema al hacer logout
      });
  }

  async updatePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (user) {
      return updatePassword(user, newPassword);
    } else {
      throw new Error('No hay usuario autenticado');
    }
  }

  registerWithEmailAndPassword(credential: Credential): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, credential.email, credential.password)
      .then(async (userCredential) => {
        if (userCredential.user) {
          this.enviarEmailVerification(userCredential);
        }
        return userCredential;
      })
      .catch(error => {
        throw error;
      });
  }

  async verifyEmailWithCode(oobCode: string): Promise<void> {
    const auth = getAuth();
    try {
      await applyActionCode(auth, oobCode);
      console.log('Correo electrónico verificado');
    } catch (error) {
      console.error('Error al verificar el correo electrónico:', error);
      throw error;
    }
  }

  loginWithEmailAndPassword(credential: Credential): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, credential.email, credential.password)
      .then(async (userCredential) => {
        // Verificar si el correo está verificado
        if (!userCredential.user?.emailVerified) {
          // Enviar nuevamente el correo de verificación
          sendEmailVerification(userCredential.user);

          // Lanzar un error con el código 'auth/email-not-verified'
          const error: any = new Error('Correo no verificado');
          error.code = 'auth/email-not-verified'; // Definir el código de error Firebase
          throw error;
        }
        localStorage.setItem('user', JSON.stringify(this.user)); // Guarda el usuario en localStorage

        this.toastrService.success("Bienvenido de nuevo! Nos alegra verte otra vez.", "Exito");

        return userCredential;
      })
      .catch((error) => {
        // Dejar que FirebaseErrorService maneje el error
        throw error;
      });
  }

  async getToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    throw new Error('No hay usuario conectado');
  }

  async loginWithGoogleProvider(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();

    try {
      localStorage.setItem('user', JSON.stringify(this.user)); // Guarda el usuario en localStorage
      return await signInWithPopup(this.auth, provider);

    } catch (error: any) {
      return error;
    }
  }

  async enviarEmailVerification(userCredential: UserCredential): Promise<void> {
    const user = userCredential.user;
    if (user && !user.emailVerified) {
      try {
        const actionCodeSettings = {
          url: 'https://proyecto-los-ciruelos.firebaseapp.com/__/auth/action',
          handleCodeInApp: true,
        };

        await sendEmailVerification(user, actionCodeSettings);
        this.toastrService.info("Correo de verificación enviado. Revisa tu correo electronico.", "Verificación requerida");
      } catch (error) {
        console.error('Error al enviar el correo de verificación:', error);
        this.toastrService.error("Error al enviar el correo de verificación. Inténtalo nuevamente.", "Error");
      }
    } else {
      this.toastrService.warning("No pudimos encontrar tu cuenta o ya verificaste tu correo.", "Atención");
    }
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  getUserEmail(): Observable<string | null> {
    return this.authState$.pipe(
      map((user) => user?.email || null)
    );
  }

  getUsuario(): Observable<User | null> {
    return this.authState$;
  }


  getUserRole(): Observable<string | null> {
    return this.authState$.pipe(
      switchMap((user) => {
        if (!user) {
          return of(null); // Si no hay usuario, retornamos null
        }

        // Llamamos al backend para verificar el rol (empleado o duenio)
        return this.http.get<{ message: string }>(`/public/verificar/empleado?email=${user.email}`).pipe(
          map((response) => {
            console.log('Respuesta del backend:', response); // Verifica lo que devuelve el backend
            return response.message; // Retorna el rol
          }),
          catchError(error => {
            console.error('Error al obtener el rol del usuario:', error);
            console.error('Cuerpo del error:', error.error);  // Aquí miramos el cuerpo de la respuesta de error
            console.error('Status del error:', error.status);  // Verifica el código de estado HTTP
            console.error('Mensaje del error:', error.message);  // Mensaje de error general
            return of(null); // En caso de error, devolvemos null
          })
        );
      })
    );
  }


}
