package com.ferreteria.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {
    
    @RequestMapping(value = {
        "/ventas",
        "/inventario",
        "/inventario/mermas",
        "/inventario/kardex",
        "/clientes",
        "/proveedores",
        "/ordenes-compra",
        "/rrhh/empleados",
        "/rrhh/asistencia",
        "/rrhh/boletas"
    })
    public String redirectSpaRoutes() {
        // Forwards the URL request internally to index.html so React Router takes over.
        return "forward:/index.html";
    }
}
