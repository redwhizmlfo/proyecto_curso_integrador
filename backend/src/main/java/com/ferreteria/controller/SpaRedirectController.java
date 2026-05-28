package com.ferreteria.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {
    
    @RequestMapping(value = {
        "/ventas",
        "/ventas/**",
        "/inventario",
        "/inventario/**",
        "/clientes",
        "/clientes/**",
        "/proveedores",
        "/proveedores/**",
        "/ordenes-compra",
        "/ordenes-compra/**",
        "/rrhh",
        "/rrhh/**",
        "/dashboard",
        "/dashboard/**"
    })
    public String redirectSpaRoutes() {
        // Forwards the URL request internally to index.html so React Router takes over.
        return "forward:/index.html";
    }
}
