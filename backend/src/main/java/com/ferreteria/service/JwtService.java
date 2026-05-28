package com.ferreteria.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.security.Key;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final String SECRET_KEY = "clave_utilizada_para_testear_jwt_de_m├ís_de_32_caracteres_de_largo";
    
    private Key getSignKey() {
        // Conversi├│n a bytes de llave en texto plano, ser├¡a una conversi├│n diferente si la llave esta en Base 64.
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }    
    
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)                
                .compact();
    }    
}
