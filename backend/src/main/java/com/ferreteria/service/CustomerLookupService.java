package com.ferreteria.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ferreteria.dto.CustomerLookupResponseDTO;
import com.ferreteria.model.Customer;
import com.ferreteria.model.SunatRucRecord;
import com.ferreteria.repository.CustomerRepository;
import com.ferreteria.repository.SunatRucRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerLookupService {

    private final CustomerRepository customerRepository;
    private final SunatRucRecordRepository sunatRucRecordRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(6))
            .build();

    @Value("${customer.lookup.enabled:false}")
    private boolean lookupEnabled;

    @Value("${customer.lookup.provider:CUSTOM}")
    private String lookupProvider;

    @Value("${customer.lookup.token:}")
    private String lookupToken;

    @Value("${customer.lookup.dni-url:}")
    private String dniUrl;

    @Value("${customer.lookup.ruc-url:}")
    private String rucUrl;

    @Transactional
    public CustomerLookupResponseDTO lookupAndStore(String rawDocument) {
        String document = normalizeDocument(rawDocument);
        String docType = resolveDocType(document);

        Optional<Customer> existing = customerRepository.findByDocNumber(document);
        if (existing.isPresent()) {
            return CustomerLookupResponseDTO.fromCustomer(existing.get(), "LOCAL_DB", false);
        }

        if (docType.equals("RUC")) {
            return lookupRucFromSunatPadron(document);
        }

        if (!lookupEnabled) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "La consulta DNI externa aun no esta habilitada. Configure customer.lookup.enabled y APIDNI."
            );
        }

        if (lookupToken == null || lookupToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Falta configurar CUSTOMER_LOOKUP_TOKEN con el token real de APIDNI."
            );
        }

        Map<String, Object> providerData = callProvider(document, docType);
        Customer customer = buildCustomer(providerData, document, docType);
        Customer saved = customerRepository.save(customer);

        return CustomerLookupResponseDTO.fromCustomer(saved, lookupProvider, true);
    }

    private CustomerLookupResponseDTO lookupRucFromSunatPadron(String document) {
        SunatRucRecord record = sunatRucRecordRepository.findById(document)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "RUC no encontrado en Padron Reducido SUNAT local. Actualice o importe el padron SUNAT."
                ));

        Customer customer = Customer.builder()
                .name(record.getBusinessName())
                .docType("RUC")
                .docNumber(record.getRuc())
                .phone("")
                .email("")
                .address(record.getFiscalAddress())
                .preferredDiscount(BigDecimal.ZERO)
                .build();

        Customer saved = customerRepository.save(customer);
        return CustomerLookupResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .docType(saved.getDocType())
                .docNumber(saved.getDocNumber())
                .phone(saved.getPhone())
                .email(saved.getEmail())
                .address(saved.getAddress())
                .preferredDiscount(saved.getPreferredDiscount())
                .status(record.getTaxpayerStatus())
                .condition(record.getDomicileCondition())
                .source(record.getSource())
                .created(true)
                .build();
    }

    private String normalizeDocument(String rawDocument) {
        String document = rawDocument == null ? "" : rawDocument.replaceAll("\\D", "");
        if (document.length() != 8 && document.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingrese un DNI de 8 digitos o RUC de 11 digitos");
        }
        return document;
    }

    private String resolveDocType(String document) {
        return document.length() == 11 ? "RUC" : "DNI";
    }

    private Map<String, Object> callProvider(String document, String docType) {
        String template = docType.equals("RUC") ? rucUrl : dniUrl;
        if (template == null || template.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "No hay URL configurada para consulta " + docType);
        }

        String url = template.replace("{document}", document);
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .header("Accept", "application/json");

        if (lookupToken != null && !lookupToken.isBlank()) {
            requestBuilder.header("Authorization", "Bearer " + lookupToken);
        }

        try {
            HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Proveedor " + lookupProvider + " respondio " + response.statusCode());
            }
            Map<String, Object> payload = objectMapper.readValue(response.body(), new TypeReference<>() {});
            return unwrapData(payload);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No se pudo leer respuesta del proveedor " + lookupProvider);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Consulta interrumpida con proveedor " + lookupProvider);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> unwrapData(Map<String, Object> payload) {
        Object data = payload.get("data");
        if (data instanceof Map<?, ?> mapData) {
            return (Map<String, Object>) mapData;
        }
        return payload;
    }

    private Customer buildCustomer(Map<String, Object> data, String document, String docType) {
        String name = docType.equals("RUC") ? firstText(data,
                "razonSocial", "razon_social", "nombre_o_razon_social", "nombre", "name")
                : fullDniName(data);

        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "El proveedor no devolvio nombre valido para " + docType);
        }

        return Customer.builder()
                .name(name)
                .docType(docType)
                .docNumber(document)
                .phone("")
                .email("")
                .address(firstText(data, "direccion", "direccionFiscal", "domicilio_fiscal", "address"))
                .preferredDiscount(BigDecimal.ZERO)
                .build();
    }

    private String fullDniName(Map<String, Object> data) {
        String fullName = firstText(data, "nombreCompleto", "nombre_completo", "nombre", "name", "nombres_completos");
        if (!fullName.isBlank()) {
            return fullName;
        }

        String names = firstText(data, "nombres", "preNombres");
        String paternal = firstText(data, "apellidoPaterno", "apellido_paterno", "apPaterno");
        String maternal = firstText(data, "apellidoMaterno", "apellido_materno", "apMaterno");
        return (names + " " + paternal + " " + maternal).trim().replaceAll("\\s+", " ");
    }

    private String firstText(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value).trim();
            }
        }
        return "";
    }
}
