package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Category;
import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;

import java.time.LocalDateTime;

public record SupportTicketUpdateRequest(
        String description,
        Status status,
        Priority priority,
        Category category,
        Long assignedToId,
        LocalDateTime slaDueAt,
        LocalDateTime resolvedAt
) {}
