package Grupo11.Seminario.DTO;

import lombok.Data;

@Data
public class MercadoPagoDTO {
    private String title;
    private Double price;
    private String successUrl;
    private String failureUrl;
    private String pendingUrl;

    public MercadoPagoDTO(String title, Double price, String successUrl, String failureUrl, String pendingUrl) {
        this.title = title;
        this.price = price;
        this.successUrl = successUrl;
        this.failureUrl = failureUrl;
        this.pendingUrl = pendingUrl;
    }
}
