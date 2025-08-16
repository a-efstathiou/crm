package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SupportTicketCreateRequest(
        @NotBlank String description,
        @NotBlank String subject,
        Priority priority,
        Long categoryId,
        Long assignedToId
) { }
