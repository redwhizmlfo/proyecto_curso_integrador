package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
@Table(name = "losses")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loss {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reverted_by_user_id")
    private User revertedByUser;

    @Column(name = "occurred_at", nullable = false)
    @Builder.Default
    private OffsetDateTime occurredAt = OffsetDateTime.now();

    @Column(name = "reverted_at")
    private OffsetDateTime revertedAt;

    @NotBlank
    @Pattern(regexp = "(?i)active|reverted")
    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "active";

    @NotBlank
    @Column(name = "product_name_snapshot", nullable = false, length = 180)
    private String productNameSnapshot;

    @NotBlank
    @Column(name = "category_snapshot", nullable = false, length = 80)
    private String categorySnapshot;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String reason;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal qty;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "unit_cost_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCostSnapshot;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "loss_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal lossAmount;

    @NotBlank
    @Column(name = "responsible_snapshot", nullable = false, length = 180)
    private String responsibleSnapshot;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
