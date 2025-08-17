package com.aefstathiou.crm.dto;

import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;

import java.time.LocalDateTime;
import java.util.List;

public record SupportTicketDTO(
        Long id,
        String description,
        String subject,
        UserSummaryDTO requester,
        UserSummaryDTO assignedTo,
        Status status,
        Priority priority,
        CategoryDTO category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt,
        List<AttachmentDTO> attachments
) { }
