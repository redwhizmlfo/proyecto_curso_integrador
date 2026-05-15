package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
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
import java.util.List;

@Entity
@Table(name = "sales")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @NotBlank
    @Column(nullable = false, length = 40)
    private String series;

    @NotBlank
    @Column(name = "document_type", nullable = false, length = 32)
    private String documentType;

    @NotBlank
    @Column(name = "payment_method", nullable = false, length = 32)
    private String paymentMethod;

    @Column(name = "sold_at", nullable = false)
    @Builder.Default
    private OffsetDateTime soldAt = OffsetDateTime.now();

    @NotBlank
    @Column(name = "client_name_snapshot", nullable = false, length = 180)
    private String clientNameSnapshot;

    @NotBlank
    @Column(name = "client_doc_type_snapshot", nullable = false, length = 16)
    private String clientDocTypeSnapshot;

    @NotBlank
    @Column(name = "client_doc_number_snapshot", nullable = false, length = 32)
    private String clientDocNumberSnapshot;

    @NotBlank
    @Column(name = "seller_name_snapshot", nullable = false, length = 180)
    private String sellerNameSnapshot;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal igv = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "discount_pct", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPct = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "text")
    private String note;

    @DecimalMin("0.00")
    @Column(name = "received_amount", precision = 12, scale = 2)
    private BigDecimal receivedAmount;

    @DecimalMin("0.00")
    @Column(name = "change_amount", precision = 12, scale = 2)
    private BigDecimal changeAmount;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
