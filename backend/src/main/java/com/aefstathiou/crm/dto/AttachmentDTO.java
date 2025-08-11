package com.aefstathiou.crm.dto;

import java.time.LocalDateTime;

public record AttachmentDTO(
        Long id,
        String fileName,
        String mimeType,
        String filePath,
        Long sizeBytes,
        Long uploadedById,
        LocalDateTime uploadedAt
) { }
