package com.aefstathiou.crm.dto;

import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.model.Category;

import java.time.LocalDateTime;
import java.util.List;

public record SupportTicketDTO(
        Long id,
        String description,
        String subject,
        Long requesterId,
        Long assignedToId,
        Status status,
        Priority priority,
        Category category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        List<AttachmentDTO> attachments
) { }
