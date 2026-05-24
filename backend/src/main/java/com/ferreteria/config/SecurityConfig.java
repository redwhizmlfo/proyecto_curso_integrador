package com.ferreteria.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for easy API usage
            .cors(cors -> {})             // Enable CORS
            .authorizeHttpRequests(auth -> auth
                // Para testear la rama sin impedimento de los roles:
                // All other endpoints are permitted to allow integration with the frontend
                .anyRequest().permitAll()
            );                   
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // Bean de usuarios en memoria para pruebas rápidas yevitar fallos de inyección:    
    // Úsarlo mientras no haya usuarios en tu BD.
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails user = User.builder()
                .username("prueba")
                .password(encoder.encode("prueba123"))
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(user);
    }
}
