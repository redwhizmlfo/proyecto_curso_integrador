package com.ferreteria.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class SupplierCategoryRequestDTO {
    private UUID supplierId;
    private String categoryName;
    private Integer sortOrder;
}
