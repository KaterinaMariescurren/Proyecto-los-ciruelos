package Grupo11.Seminario.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStream;

@Service
public class FirebaseInitializer {

    @PostConstruct
    public void initialize() {
        try {
            String firebaseCredentialsPath = System.getenv("FIREBASE_CREDENTIALS_PATH");
            if (firebaseCredentialsPath == null || firebaseCredentialsPath.isEmpty()) {
                throw new IllegalStateException("La variable de entorno FIREBASE_CREDENTIALS_PATH no está configurada.");
            }

            InputStream serviceAccount = new FileInputStream(firebaseCredentialsPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase inicializado correctamente.");
            } else {
                System.out.println("⚠️ Firebase ya estaba inicializado.");
            }
        } catch (Exception e) {
            throw new RuntimeException("❌ Error al inicializar Firebase: " + e.getMessage(), e);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();  // Retorna la instancia de FirebaseAuth
    }
}
