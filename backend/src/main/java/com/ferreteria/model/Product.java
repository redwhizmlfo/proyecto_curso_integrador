package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String name;

    @NotBlank
    @Column(nullable = false, unique = true, length = 80)
    private String barcode;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String category;

    @NotBlank
    @Column(name = "supplier_name_snapshot", nullable = false, length = 180)
    private String supplierNameSnapshot;

    @NotBlank
    @Column(nullable = false, length = 30)
    private String unit;

    @Column(columnDefinition = "text")
    private String description;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal cost = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal stock = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "min_stock", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minStock = BigDecimal.ZERO;

    @Column(name = "last_reason", length = 180)
    private String lastReason;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
