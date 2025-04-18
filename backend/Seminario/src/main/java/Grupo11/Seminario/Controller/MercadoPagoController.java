package Grupo11.Seminario.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;

import Grupo11.Seminario.DTO.MercadoPagoDTO;
import Grupo11.Seminario.Entities.Usuario;
import Grupo11.Seminario.Service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping(path = "/private")
public class MercadoPagoController {

    @Autowired
    UsuarioService usuario_service;
    
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${mercado-pago.access-token}")
    private String accessToken;

    @PostMapping("/mercadopago/preference")
    public ResponseEntity<?> createPreference(HttpServletRequest request1, @RequestBody MercadoPagoDTO dto) {
        String email = (String) request1.getAttribute("email");

        Optional<Usuario> o_usuario = usuario_service.buscar_usuario(email);
        if (o_usuario.isPresent()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> item = new HashMap<>();
            item.put("title", dto.getTitle());
            item.put("quantity", 1);
            item.put("unit_price", dto.getPrice());
            item.put("currency_id", "ARS");

            Map<String, Object> body = new HashMap<>();
            body.put("items", List.of(item));
            body.put("back_urls", Map.of(
                    "success", dto.getSuccessUrl(),
                    "failure", dto.getFailureUrl(),
                    "pending", dto.getPendingUrl()
            ));
            body.put("auto_return", "approved");

            HttpEntity<Map<String, Object>> request2 = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.mercadopago.com/checkout/preferences", request2, Map.class
            );

            return ResponseEntity.ok(Map.of("preferenceId", response.getBody().get("id")));   
        }
        return null;
    }
}