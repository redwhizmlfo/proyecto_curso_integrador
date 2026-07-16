package com.ferreteria.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_box_history")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBoxHistory {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(name = "box_name", nullable = false, length = 160)
    private String boxName;

    @Column(name = "brand_name", length = 180)
    private String brandName;

    @NotBlank
    @Column(name = "items_json", nullable = false, columnDefinition = "text")
    private String itemsJson;

    @CreatedDate
    @Column(name = "released_at", nullable = false, updatable = false)
    private OffsetDateTime releasedAt;
}
