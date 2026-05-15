package com.ferreteria.model;

import jakarta.persistence.*;
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
@Table(name = "stock_movements")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @Column(name = "occurred_at", nullable = false)
    @Builder.Default
    private OffsetDateTime occurredAt = OffsetDateTime.now();

    @NotBlank
    @Column(name = "movement_type", nullable = false, length = 32)
    private String movementType;

    @Column(name = "source_module", length = 32)
    private String sourceModule;

    @Column(name = "reason_code", length = 64)
    private String reasonCode;

    @NotNull
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal delta;

    @NotBlank
    @Column(name = "unit_snapshot", nullable = false, length = 30)
    private String unitSnapshot;

    @NotNull
    @Column(name = "stock_before", nullable = false, precision = 12, scale = 2)
    private BigDecimal stockBefore;

    @NotNull
    @Column(name = "stock_after", nullable = false, precision = 12, scale = 2)
    private BigDecimal stockAfter;

    @Column(columnDefinition = "text")
    private String detail;

    @NotBlank
    @Column(name = "product_name_snapshot", nullable = false, length = 180)
    private String productNameSnapshot;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
