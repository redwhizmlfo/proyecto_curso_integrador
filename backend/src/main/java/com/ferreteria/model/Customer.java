package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
import java.util.UUID;

@Entity
@Table(name = "customers")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String name;

    @NotBlank
    @Pattern(regexp = "(?i)dni|ruc")
    @Column(name = "doc_type", nullable = false, length = 16)
    private String docType;

    @NotBlank
    @Column(name = "doc_number", nullable = false, length = 32)
    private String docNumber;

    @Column(length = 40)
    private String phone;

    @Column(length = 180)
    private String email;

    @Column(columnDefinition = "text")
    private String address;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Column(name = "preferred_discount", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal preferredDiscount = BigDecimal.ZERO;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
