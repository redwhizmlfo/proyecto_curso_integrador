package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(
        name = "sales_workflow_documents",
        indexes = {
                @Index(name = "sales_workflow_kind_idx", columnList = "document_kind"),
                @Index(name = "sales_workflow_doc_number_idx", columnList = "doc_number", unique = true)
        }
)
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesWorkflowDocument {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(name = "document_kind", nullable = false, length = 32)
    private String documentKind;

    @NotBlank
    @Column(name = "doc_number", nullable = false, unique = true, length = 40)
    private String docNumber;

    @Column(name = "order_number", length = 40)
    private String orderNumber;

    @NotNull
    @Column(name = "document_date", nullable = false)
    private OffsetDateTime date;

    @NotBlank
    @Column(name = "customer_json", nullable = false, columnDefinition = "text")
    private String customerJson;

    @NotBlank
    @Column(name = "items_json", nullable = false, columnDefinition = "text")
    private String itemsJson;

    @Column(name = "payment_method", length = 80)
    private String paymentMethod;

    @Column(name = "payment_status", length = 32)
    private String paymentStatus;

    @Column(name = "payment_reference", length = 120)
    private String paymentReference;

    @Column(name = "payment_evidence_name", length = 220)
    private String paymentEvidenceName;

    @Column(name = "payment_bank_name", length = 80)
    private String paymentBankName;

    @Column(name = "payment_bank_account_alias", length = 120)
    private String paymentBankAccountAlias;

    @Column(name = "payment_bank_account_number", length = 80)
    private String paymentBankAccountNumber;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "igv", precision = 12, scale = 2)
    private BigDecimal igv;

    @NotNull
    @Column(name = "total", nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(name = "discount_pct", precision = 5, scale = 2)
    private BigDecimal discountPct;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "status", length = 80)
    private String status;

    @Column(name = "origin_address", length = 240)
    private String originAddress;

    @Column(name = "destination_address", length = 240)
    private String destinationAddress;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
