package com.aefstathiou.crm.service;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.exception.FileStorageException;
import com.aefstathiou.crm.exception.FileValidationException;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.model.Attachment;
import com.aefstathiou.crm.model.SupportRequest;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.AttachmentRepository;
import com.aefstathiou.crm.repository.SupportRequestRepository;
import com.aefstathiou.crm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final SupportRequestRepository supportRequestRepository;
    private final UserRepository userRepository;

    private final Path rootLocation = Paths.get("uploads"); // folder in your server

    public Attachment storeFile(Long supportRequestId, MultipartFile file, Principal principal) {
        long maxSizeBytes = 5 * 1024 * 1024; // 5 MB
        if (file.getSize() > maxSizeBytes) {
            throw new FileValidationException("File size exceeds the maximum allowed limit of 5 MB");
        }

        List<String> allowedExtensions = List.of("png", "jpg", "jpeg", "pdf", "txt");
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new FileValidationException("Invalid file name");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new FileValidationException("Invalid file type. Allowed: " + allowedExtensions);
        }

        SupportRequest request = supportRequestRepository.findById(supportRequestId)
                .orElseThrow(() -> new RuntimeException("Support request not found"));

        User uploader = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Ensure folder exists
            Files.createDirectories(rootLocation);

            // Generate unique filename
            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = rootLocation.resolve(uniqueName).normalize().toAbsolutePath();

            // Save file on disk
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);


            // Save attachment metadata
            Attachment attachment = Attachment.builder()
                    .supportRequest(request)
                    .fileName(file.getOriginalFilename())
                    .mimeType(file.getContentType())
                    .filePath(destination.toString())
                    .sizeBytes(file.getSize())
                    .uploadedBy(uploader)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new FileStorageException("Could not store file " + originalFilename, e);
        }

    }

    public UrlResource loadFileAsResource(Attachment attachment) throws Exception {
        Path path = Paths.get(attachment.getFilePath());
        return new UrlResource(path.toUri());
    }

    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));
    }

    public List<Attachment> getAttachmentsForRequest(Long requestId) {
        return attachmentRepository.findBySupportRequestId(requestId);
    }

    public boolean canUserAccessAttachment(Attachment attachment, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPPORT_AGENT
                || currentUser.getRole() == Role.SUPERVISOR) {
            return true;
        }

        if (currentUser.getRole() == Role.CUSTOMER) {
            return attachment.getSupportRequest().getRequester().getId().equals(currentUser.getId());
        }

        throw new ForbiddenException("You do not have permission to access this attachment");
    }
}
