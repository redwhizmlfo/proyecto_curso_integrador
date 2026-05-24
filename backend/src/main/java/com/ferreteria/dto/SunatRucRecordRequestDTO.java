package com.ferreteria.dto;

import lombok.Data;

@Data
public class SunatRucRecordRequestDTO {
    private String ruc;
    private String businessName;
    private String taxpayerStatus;
    private String domicileCondition;
    private String ubigeo;
    private String fiscalAddress;
}
