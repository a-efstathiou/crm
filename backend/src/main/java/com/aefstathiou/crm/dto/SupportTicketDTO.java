package com.aefstathiou.crm.dto;

import com.aefstathiou.crm.enums.Category;
import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;

import java.time.LocalDateTime;
import java.util.List;

public record SupportTicketDTO(
        Long id,
        String description,
        Long requesterId,
        Long assignedToId,
        Status status,
        Priority priority,
        Category category,
        LocalDateTime slaDueAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        List<AttachmentDTO> attachments
) { }
