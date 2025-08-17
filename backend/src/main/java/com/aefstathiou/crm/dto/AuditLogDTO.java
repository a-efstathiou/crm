package com.aefstathiou.crm.dto;

import java.time.LocalDateTime;

public record AuditLogDTO(
        Long id,
        String actorFullName,
        String action,
        String details,
        LocalDateTime timestamp
) {}
