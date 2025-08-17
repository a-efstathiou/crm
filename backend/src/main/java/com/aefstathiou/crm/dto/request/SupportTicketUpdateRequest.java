package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;

public record SupportTicketUpdateRequest(
        String subject,
        Status status,
        Priority priority,
        Long categoryId,
        Long assignedToId
) {}
