package com.ferreteria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SunatRucImportResultDTO {
    private long processed;
    private long imported;
    private long skipped;
    private String source;
    private String message;
}
