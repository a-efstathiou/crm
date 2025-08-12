package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.model.Attachment;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class AttachmentDTOMapper implements Function<Attachment, AttachmentDTO> {

    @Override
    public AttachmentDTO apply(Attachment attachment) {
        if (attachment == null) return null;
        Long uploadedById = (attachment.getUploadedBy() != null) ? attachment.getUploadedBy().getId() : null;

        return new AttachmentDTO(
                attachment.getId(),
                attachment.getFileName(),
                attachment.getMimeType(),
                attachment.getFilePath(),
                attachment.getSizeBytes(),
                uploadedById,
                attachment.getUploadedAt()
        );
    }
}
