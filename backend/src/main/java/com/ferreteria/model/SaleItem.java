package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sale_items")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleItem {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank
    @Column(name = "product_name_snapshot", nullable = false, length = 180)
    private String productNameSnapshot;

    @NotBlank
    @Column(name = "barcode_snapshot", nullable = false, length = 80)
    private String barcodeSnapshot;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "supplier_name_snapshot", length = 180)
    private String supplierNameSnapshot;

    @NotBlank
    @Column(name = "category_snapshot", nullable = false, length = 80)
    private String categorySnapshot;

    @NotBlank
    @Column(name = "unit_snapshot", nullable = false, length = 30)
    private String unitSnapshot;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal qty;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @NotNull
    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cost;

    @Column(name = "line_total", precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal lineTotal;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
