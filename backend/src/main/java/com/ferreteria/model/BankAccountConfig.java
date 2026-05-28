package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bank_account_configs")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankAccountConfig {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(name = "bank_name", nullable = false, length = 80)
    private String bankName;

    @NotBlank
    @Column(name = "account_alias", nullable = false, length = 120)
    private String accountAlias;

    @NotBlank
    @Column(name = "account_holder_name", nullable = false, length = 180)
    private String accountHolderName;

    @NotBlank
    @Column(name = "account_number", nullable = false, length = 80)
    private String accountNumber;

    @Column(length = 80)
    private String cci;

    @NotBlank
    @Column(nullable = false, length = 8)
    @Builder.Default
    private String currency = "PEN";

    @Column(name = "document_type", length = 16)
    private String documentType;

    @Column(name = "document_number", length = 32)
    private String documentNumber;

    @Column(name = "supports_api", nullable = false)
    @Builder.Default
    private boolean supportsApi = false;

    @Column(name = "provider_code", length = 80)
    private String providerCode;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
