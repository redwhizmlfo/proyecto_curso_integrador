package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_orders")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sent_by_user_id")
    private User sentByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by_user_id")
    private User receivedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @NotBlank
    @Column(name = "supplier_name_snapshot", nullable = false, length = 180)
    private String supplierNameSnapshot;

    @NotBlank
    @Pattern(regexp = "(?i)pendiente|enviado|recibido|cancelado")
    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "pendiente";

    @NotBlank
    @Pattern(regexp = "(?i)baja|media|alta|urgente")
    @Column(nullable = false, length = 32)
    @Builder.Default
    private String priority = "media";

    @Column(columnDefinition = "text")
    private String note;

    @Column(name = "ordered_at", nullable = false)
    @Builder.Default
    private OffsetDateTime orderedAt = OffsetDateTime.now();

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @Column(name = "received_at")
    private OffsetDateTime receivedAt;

    @Column(name = "cancelled_at")
    private OffsetDateTime cancelledAt;

    @Column(name = "total_units", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalUnits = BigDecimal.ZERO;

    @Column(name = "total_lines", nullable = false)
    @Builder.Default
    private Integer totalLines = 0;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderItem> items;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
