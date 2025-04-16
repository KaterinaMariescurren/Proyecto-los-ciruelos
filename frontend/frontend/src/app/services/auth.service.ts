import { Injectable, inject } from '@angular/core';
import {
  Auth,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  authState,
  signInWithEmailAndPassword,
  User,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from '@angular/fire/auth';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { applyActionCode, getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { HttpClient } from '@angular/common/http';  // Importamos HttpClient para las solicitudes HTTP

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
  isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(
      map(user => !!user)
    );
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

  async verifyEmailWithCode(oobCode: string): Promise<void> {
    try {
      const auth = getAuth();
      await applyActionCode(auth, oobCode);
    } catch (error: any) {
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
          signOut(this.auth);
          // Lanzar un error con el código 'auth/email-not-verified'
          const error: any = new Error('Correo no verificado');
          error.code = 'auth/email-not-verified'; // Definir el código de error Firebase
          throw error;
        }
        localStorage.setItem('user', JSON.stringify(this.user)); // Guarda el usuario en localStorage

        return userCredential;
      })
      .catch((error) => {
        // Dejar que FirebaseErrorService maneje el error
        throw error;
      });
  }

  // Obtener el ID Token de Firebase
  getIdToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const subscription = this.authState$.pipe(
        switchMap(user => {
          if (user) {
            return user.getIdToken();
          } else {
            return of(null);
          }
        })
      ).subscribe({
        next: (token) => {
          subscription.unsubscribe();
          if (token) {
            resolve(token);
          } else {
            reject(new Error('No hay usuario conectado'));
          }
        },
        error: (err) => {
          subscription.unsubscribe();
          reject(err);
        }
      });
    });
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
          url: 'http://localhost:4200/verificar-correo', 
          handleCodeInApp: true,
        };

        await sendEmailVerification(user, actionCodeSettings);
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

}
