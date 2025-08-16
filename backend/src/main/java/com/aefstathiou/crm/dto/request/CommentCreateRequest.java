package com.aefstathiou.crm.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CommentCreateRequest(
        @NotBlank
        String content,
        Boolean isInternalNote
) {
}
