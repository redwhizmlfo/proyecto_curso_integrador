package com.ferreteria.controller;

import com.ferreteria.model.Product;
import com.ferreteria.model.Sale;
import com.ferreteria.repository.CustomerRepository;
import com.ferreteria.repository.ProductRepository;
import com.ferreteria.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> summary = new HashMap<>();

        // 1. Total Products & Low Stock Alerts
        List<Product> products = productRepository.findAll();
        long activeProducts = products.stream().filter(Product::isActive).count();
        long lowStock = products.stream().filter(p -> p.isActive() && p.getStock().compareTo(p.getMinStock()) <= 0).count();

        // 2. Total Sales & Recent
        List<Sale> sales = saleRepository.findAll();
        sales.sort((a, b) -> b.getSoldAt().compareTo(a.getSoldAt())); // Sort by date desc
        
        BigDecimal totalSalesRevenue = sales.stream()
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        List<Sale> recentSales = sales.size() > 5 ? sales.subList(0, 5) : sales;
        List<Product> lowStockItems = products.stream()
                .filter(p -> p.isActive() && p.getStock().compareTo(p.getMinStock()) <= 0)
                .limit(5)
                .toList();

        // 3. Total Customers
        long totalCustomers = customerRepository.count();

        summary.put("totalProducts", activeProducts);
        summary.put("lowStockAlerts", lowStock);
        summary.put("totalSalesRevenue", totalSalesRevenue);
        summary.put("totalCustomers", totalCustomers);
        summary.put("recentSales", recentSales);
        summary.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(summary);
    }
}
