package com.ferreteria.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "sunat_ruc_records")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SunatRucRecord {

    @Id
    @Column(length = 11, nullable = false)
    private String ruc;

    @Column(name = "business_name", nullable = false, length = 240)
    private String businessName;

    @Column(name = "taxpayer_status", length = 80)
    private String taxpayerStatus;

    @Column(name = "domicile_condition", length = 80)
    private String domicileCondition;

    @Column(length = 12)
    private String ubigeo;

    @Column(name = "fiscal_address", columnDefinition = "text")
    private String fiscalAddress;

    @Column(name = "source", length = 80)
    @Builder.Default
    private String source = "SUNAT_PADRON_REDUCIDO";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
