package com.aefstathiou.crm.dto.request;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentRequest(
        @NotBlank
        String content
) { }
