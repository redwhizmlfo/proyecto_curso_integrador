package com.ferreteria.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AttendanceRequestDTO {
    private UUID employeeId;
    private UUID markedByUserId;
    private java.time.LocalDate workDate;
}
