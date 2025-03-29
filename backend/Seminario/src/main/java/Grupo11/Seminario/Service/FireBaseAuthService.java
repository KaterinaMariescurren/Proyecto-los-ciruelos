package Grupo11.Seminario.Service;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

@Service
@Transactional
public class FireBaseAuthService {
    
    public FirebaseToken verifyToken(String idToken) throws Exception {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }
}
