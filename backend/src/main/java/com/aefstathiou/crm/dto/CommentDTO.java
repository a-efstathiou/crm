package com.aefstathiou.crm.dto;

import java.time.LocalDateTime;

public record CommentDTO(
        Long id,
        String content,
        Long authorId,
        String authorFullName,
        boolean isInternalNote,
        LocalDateTime createdAt
) {
}
