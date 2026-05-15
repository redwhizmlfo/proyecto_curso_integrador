package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "employee_slips")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSlip {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @NotBlank
    @Column(name = "slip_number", nullable = false, unique = true, length = 40)
    private String slipNumber;

    @NotBlank
    @Column(name = "period_label", nullable = false, length = 40)
    private String periodLabel;

    @Column(name = "issued_at", nullable = false)
    @Builder.Default
    private OffsetDateTime issuedAt = OffsetDateTime.now();

    @DecimalMin("0.00")
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @DecimalMin("0.00")
    @Column(name = "worked_days_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal workedDaysSnapshot;

    @DecimalMin("0.00")
    @Column(name = "pay_per_day_snapshot", nullable = false, precision = 12, scale = 2)
    private BigDecimal payPerDaySnapshot;

    @NotBlank
    @Column(name = "employee_name_snapshot", nullable = false, length = 180)
    private String employeeNameSnapshot;

    @NotBlank
    @Column(name = "employee_dni_snapshot", nullable = false, length = 32)
    private String employeeDniSnapshot;

    @NotBlank
    @Column(name = "employee_role_snapshot", nullable = false, length = 80)
    private String employeeRoleSnapshot;

    @Column(name = "username_snapshot", length = 80)
    private String usernameSnapshot;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
