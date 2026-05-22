package com.ferreteria.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        /*
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for easy API usage
            .cors(cors -> {})             // Enable CORS
            .authorizeHttpRequests(auth -> auth
                // Specific admin endpoints require role ADMIN
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                // All other endpoints are permitted to allow integration with the frontend
                .anyRequest().permitAll()
            )
            .httpBasic(basic -> {}); // Enable basic auth schema for rubric compliance
        
        return http.build();
        */
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for easy API usage
            .cors(cors -> {})             // Enable CORS
            .authorizeHttpRequests(auth -> auth
                // Specific admin endpoints require role ADMIN
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                // All other endpoints are permitted to allow integration with the frontend
                .anyRequest().permitAll()
            )
            .sessionManagement(s ->
            s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
