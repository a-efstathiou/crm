package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.dto.CategoryDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.dto.UserSummaryDTO;
import com.aefstathiou.crm.model.SupportTicket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportTicketDTOMapper implements Function<SupportTicket, SupportTicketDTO> {

    private final AttachmentDTOMapper attachmentDTOMapper;
    private final UserDTOMapper userDTOMapper;
    private final CategoryDTOMapper categoryDTOMapper;

    @Override
    public SupportTicketDTO apply(SupportTicket supportTicket) {
        if (supportTicket == null) return null;

        UserSummaryDTO assignedToDto = null;
        if (supportTicket.getAssignedTo() != null) {
            assignedToDto = userDTOMapper.toSummaryDTO(supportTicket.getAssignedTo());
        }

        return new SupportTicketDTO(
                supportTicket.getId(),
                supportTicket.getDescription(),
                supportTicket.getSubject(),
                userDTOMapper.toSummaryDTO(supportTicket.getRequester()),
                assignedToDto,
                supportTicket.getStatus(),
                supportTicket.getPriority(),
                categoryDTOMapper.apply(supportTicket.getCategory()),
                supportTicket.getCreatedAt(),
                supportTicket.getUpdatedAt(),
                supportTicket.getResolvedAt(),
                supportTicket.getAttachments().stream().map(attachmentDTOMapper).collect(Collectors.toList())
        );
    }
}
