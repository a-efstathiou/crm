package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Category;
import com.aefstathiou.crm.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SupportTicketCreateRequest(
        @NotBlank String description,
        @NotNull Long requesterId,
        Priority priority,
        Category category,
        Long assignedToId
) { }
