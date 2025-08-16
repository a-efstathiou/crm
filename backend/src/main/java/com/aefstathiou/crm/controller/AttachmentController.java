package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.model.Attachment;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.service.AttachmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/attachments")
@AllArgsConstructor
public class AttachmentController {
    private final AttachmentService attachmentService;
    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;

    @PostMapping("/upload/{supportRequestId}")
    public ResponseEntity<Attachment> uploadFile(
            @PathVariable Long supportRequestId,
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        Attachment saved = attachmentService.storeFile(supportRequestId, file, principal);
        return ResponseEntity.ok(saved);

    }

    @PostMapping("/upload-multiple/{supportRequestId}")
    public ResponseEntity<List<Attachment>> uploadMultipleFiles(
            @PathVariable Long supportRequestId,
            @RequestParam("files") List<MultipartFile> files,
            Principal principal) {

        List<Attachment> savedAttachments = files.stream()
                .map(file -> attachmentService.storeFile(supportRequestId, file, principal))
                .toList();

        return ResponseEntity.ok(savedAttachments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getAttachment(@PathVariable Long id, Principal principal) {

        Attachment attachment = attachmentService.getAttachmentById(id);

        if (!attachmentService.canUserAccessAttachment(attachment, principal)) {
            throw new ForbiddenException("You do not have permission to access this attachment");
        }

        Resource resource = attachmentService.loadFileAsResource(attachment);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFileName() + "\"")
                .body(resource);


    }

    @GetMapping("/support-request/{supportRequestId}")
    public ResponseEntity<List<Attachment>> getAttachmentsForRequest(
            @PathVariable Long supportRequestId,
            Principal principal) {

        SupportTicket request = supportTicketRepository.findById(supportRequestId)
                .orElseThrow(() -> new EntityNotFoundException("Support request not found with ID " + supportRequestId));

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.SUPPORT_AGENT) {
            if (!request.getRequester().getId().equals(currentUser.getId())) {
                throw new ForbiddenException("You do not have permission to view attachments for this ticket");
            }
        }

        return ResponseEntity.ok(attachmentService.getAttachmentsForRequest(supportRequestId));
    }
}
