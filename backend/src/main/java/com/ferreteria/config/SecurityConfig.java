package com.ferreteria.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Comma-separated list of allowed CORS origins.
     * Set env var CORS_ALLOWED_ORIGINS in production to include the Vercel URL.
     * Example: https://mi-ferreteria.vercel.app,https://www.mi-ferreteria.com
     */
    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private String corsAllowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) ->
                    response.sendError(401, "No autenticado")
                )
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    response.sendError(403, "Acceso denegado")
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/favicon.svg",
                    "/icons.svg",
                    "/assets/**"
                ).permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers(
                    "/ventas/**",
                    "/inventario/**",
                    "/clientes/**",
                    "/proveedores/**",
                    "/ordenes-compra/**",
                    "/rrhh/**",
                    "/dashboard/**",
                    "/panel-permisos/**"
                ).permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/customers/**", "/api/customer-lookup/**")
                    .access(hasAnyPermission("clientes", "ventas:pos"))
                .requestMatchers("/api/suppliers/**", "/api/supplier-categories/**")
                    .access(hasAnyPermission("proveedores", "ordenes-compra"))
                .requestMatchers("/api/orders/**")
                    .access(hasAnyPermission("ordenes-compra"))
                .requestMatchers("/api/sales/**", "/api/payment-config/**")
                    .access(hasAnyPermission("ventas:pos", "ventas:historial", "ventas:cotizaciones", "ventas:pedidos"))
                .requestMatchers(
                    "/api/products/**",
                    "/api/modelos/**",
                    "/api/categorias/**",
                    "/api/marcas/**",
                    "/api/especificaciones/**",
                    "/api/imagenes-modelos/**",
                    "/api/product-images/**",
                    "/api/stock-movements/**",
                    "/api/losses/**"
                ).access(hasAnyPermission(
                    "inventario:catalogo",
                    "inventario:stock",
                    "inventario:movimientos",
                    "inventario:alertas",
                    "inventario:kardex",
                    "ventas:pos",
                    "ordenes-compra"
                ))
                .requestMatchers("/api/employees/**")
                    .access(hasAnyPermission("rrhh:empleados", "rrhh:asistencia", "rrhh:boletas", "seguridad:panel-permisos"))
                .requestMatchers("/api/attendance/**")
                    .access(hasAnyPermission("rrhh:asistencia"))
                .requestMatchers("/api/slips/**")
                    .access(hasAnyPermission("rrhh:boletas"))
                .requestMatchers("/api/dashboard/**")
                    .access(hasAnyPermission(
                        "dashboard:home",
                        "dashboard:ventas",
                        "dashboard:inventario",
                        "dashboard:clientes",
                        "dashboard:proveedores",
                        "dashboard:usuarios"
                    ))
                .requestMatchers("/api/sunat-ruc-records/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
                .anyRequest().permitAll()
            )
            .httpBasic(basic -> basic.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    private WebExpressionAuthorizationManager hasAnyPermission(String... permissions) {
        StringBuilder expression = new StringBuilder("hasRole('ADMIN')");
        for (String permission : permissions) {
            expression.append(" or hasAuthority('").append(permission).append("')");
        }
        return new WebExpressionAuthorizationManager(expression.toString());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Origins are read from cors.allowed-origins property (env var CORS_ALLOWED_ORIGINS)
        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
