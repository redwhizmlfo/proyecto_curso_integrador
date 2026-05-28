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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "employees")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(nullable = false, length = 16)
    private String initials;

    @NotBlank
    @Column(nullable = false, length = 180)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 80)
    private String role;

    @NotBlank
    @Column(nullable = false, unique = true, length = 32)
    private String dni;

    @DecimalMin("0.00")
    @Column(name = "pay_per_day", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal payPerDay = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "worked_days", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal workedDays = BigDecimal.ZERO;

    @Column(name = "today_status", length = 32)
    private String todayStatus;

    @Column(name = "attendance_today")
    private Boolean attendanceToday;

    @Column(name = "can_mark_exit", nullable = false)
    @Builder.Default
    private boolean canMarkExit = false;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
