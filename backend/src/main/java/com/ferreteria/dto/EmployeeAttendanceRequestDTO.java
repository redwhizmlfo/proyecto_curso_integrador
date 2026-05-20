package com.ferreteria.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttendanceRequestDTO {
    private UUID employeeId;
    private UUID markedByUserId;
    private LocalDate workDate;
    private OffsetDateTime entryAt;
    private OffsetDateTime exitAt;
    private String status;
    
}
