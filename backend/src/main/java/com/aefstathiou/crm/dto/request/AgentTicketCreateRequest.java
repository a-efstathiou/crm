package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Priority;
import jakarta.validation.constraints.NotBlank;

public record AgentTicketCreateRequest(
        @NotBlank String description,
        @NotBlank String subject,
        Priority priority,
        Long categoryId,
        Long requesterId,
        Long assignedToId
) { }
