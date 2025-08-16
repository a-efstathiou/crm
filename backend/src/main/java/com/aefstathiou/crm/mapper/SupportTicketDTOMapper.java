package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.model.SupportTicket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class SupportTicketDTOMapper implements Function<SupportTicket, SupportTicketDTO> {

    private final AttachmentDTOMapper attachmentDTOMapper;

    @Override
    public SupportTicketDTO apply(SupportTicket supportTicket) {
        if (supportTicket == null) return null;

        Long requesterId = (supportTicket.getRequester() != null) ? supportTicket.getRequester().getId() : null;
        Long assignedToId = (supportTicket.getAssignedTo() != null) ? supportTicket.getAssignedTo().getId() : null;

        List<AttachmentDTO> attachments = (supportTicket.getAttachments() == null) ? List.of()
                : supportTicket.getAttachments().stream().map(attachmentDTOMapper).toList();

        return new SupportTicketDTO(
                supportTicket.getId(),
                supportTicket.getDescription(),
                supportTicket.getSubject(),
                requesterId,
                assignedToId,
                supportTicket.getStatus(),
                supportTicket.getPriority(),
                supportTicket.getCategory(),
                supportTicket.getCreatedAt(),
                supportTicket.getUpdatedAt(),
                supportTicket.getResolvedAt(),
                attachments
        );
    }
}
