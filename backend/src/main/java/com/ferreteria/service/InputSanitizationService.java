package com.ferreteria.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class InputSanitizationService {

    public String requiredText(String value, String fieldName) {
        String cleanValue = optionalText(value, fieldName);
        if (cleanValue == null || cleanValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " es obligatorio");
        }
        return cleanValue;
    }

    public String optionalText(String value, String fieldName) {
        if (value == null) {
            return null;
        }
        String cleanValue = value.trim();
        String normalized = cleanValue.toLowerCase(Locale.ROOT);
        if (normalized.contains("<")
                || normalized.contains(">")
                || normalized.contains("javascript:")
                || normalized.contains("data:text/html")
                || normalized.contains("onerror")
                || normalized.contains("onload")
                || normalized.contains("<script")
                || normalized.contains("</script")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " contiene contenido no permitido");
        }
        return cleanValue;
    }
}
