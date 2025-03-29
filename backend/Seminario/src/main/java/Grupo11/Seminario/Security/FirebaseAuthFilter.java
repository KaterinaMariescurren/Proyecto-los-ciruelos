package Grupo11.Seminario.Security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import Grupo11.Seminario.Entities.Usuario;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class FirebaseAuthFilter extends GenericFilterBean {

    private final UsuarioService usuarioService;

    public FirebaseAuthFilter(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String requestURI = httpRequest.getRequestURI();

        // Excluir rutas públicas
        if (requestURI.startsWith("/public/") || requestURI.startsWith("/configuracion_general/public/")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = httpRequest.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            enviarError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Token no proporcionado");
            return;
        }

        String idToken = authHeader.substring(7); // Remover "Bearer "

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            System.out.println("✅ Token válido. Usuario autenticado: " + email);

            Optional<Usuario> usuarioOptional = usuarioService.buscar_usuario(email);
            if (usuarioOptional.isEmpty()) {
                enviarError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Usuario no registrado en la base de datos");
                return;
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());

            SecurityContextHolder.getContext().setAuthentication(authentication);
            httpRequest.setAttribute("email", email);
            chain.doFilter(request, response);
        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            System.err.println("❌ Error verificando token: " + e.getMessage());
            enviarError(httpResponse, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o expirado");
        } catch (Exception e) {
            System.err.println("❌ Error desconocido: " + e.getMessage());
            enviarError(httpResponse, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error interno del servidor");
        }
    }

    private void enviarError(HttpServletResponse response, int status, String mensaje) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\": \"" + mensaje + "\"}");
    }
}


