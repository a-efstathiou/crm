package com.aefstathiou.crm.service;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.exception.FileStorageException;
import com.aefstathiou.crm.exception.FileValidationException;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.model.Attachment;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.AttachmentRepository;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
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
    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AttachmentService.class);

    private final Path rootLocation = Paths.get("uploads");

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

        SupportTicket request = supportTicketRepository.findById(supportRequestId)
                .orElseThrow(() -> new EntityNotFoundException("Support request not found"));

        User uploader = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        try {
            Files.createDirectories(rootLocation);

            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destination = rootLocation.resolve(uniqueName).normalize().toAbsolutePath();

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = Attachment.builder()
                    .supportTicket(request)
                    .fileName(file.getOriginalFilename())
                    .mimeType(file.getContentType())
                    .filePath(uniqueName)
                    .sizeBytes(file.getSize())
                    .uploadedBy(uploader)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException e) {
            throw new FileStorageException("Could not store file " + originalFilename, e);
        }

    }

    public UrlResource loadFileAsResource(Attachment attachment){
        try {
            Path filePath = resolvePath(attachment.getFilePath());
            UrlResource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new FileNotFoundException("File not found or not readable: " + filePath);
            }

            return resource;
        } catch (IOException e) {
            throw new FileStorageException("Could not retrieve file " + attachment.getFileName(), e);
        }
    }

    public UrlResource loadFileAsResourceByPath(String storedPath){
        try {
            Path filePath = resolvePath(storedPath);
            UrlResource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new FileNotFoundException("File not found or not readable: " + filePath);
            }

            return resource;
        } catch (IOException e) {
            throw new FileStorageException("Could not retrieve file: " + storedPath, e);
        }
    }

    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Attachment not found"));
    }

    public List<Attachment> getAttachmentsForRequest(Long requestId) {
        return attachmentRepository.findBySupportTicket_Id(requestId);
    }

    public boolean canUserAccessAttachment(Attachment attachment, Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPPORT_AGENT
                || currentUser.getRole() == Role.SUPERVISOR) {
            return true;
        }

        if (currentUser.getRole() == Role.CUSTOMER) {
            return attachment.getSupportTicket().getRequester().getId().equals(currentUser.getId());
        }

        throw new ForbiddenException("You do not have permission to access this attachment");
    }

    private Path resolvePath(String storedPath) {
        Path p = Paths.get(storedPath);

        Path file = p.isAbsolute() ? p.normalize()
                : rootLocation.resolve(storedPath).normalize();

        if (!file.startsWith(rootLocation) && !p.isAbsolute()) {
            throw new SecurityException("Invalid file path: " + storedPath);
        }
        return file;
    }

    public String storeLogo(MultipartFile file) {
        long maxSizeBytes = 2 * 1024 * 1024; // 2 MB limit for logos
        if (file.isEmpty()) {
            throw new FileValidationException("File to upload cannot be empty");
        }
        if (file.getSize() > maxSizeBytes) {
            throw new FileValidationException("Logo size exceeds the maximum allowed limit of 2 MB");
        }

        List<String> allowedExtensions = List.of("png", "jpg", "jpeg", "svg");
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new FileValidationException("Invalid file name");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!allowedExtensions.contains(extension)) {
            throw new FileValidationException("Invalid file type for logo. Allowed: " + allowedExtensions);
        }

        try {
            Files.createDirectories(rootLocation);

            String uniqueName = "logo_" + UUID.randomUUID() + "." + extension;
            Path destination = rootLocation.resolve(uniqueName).normalize().toAbsolutePath();

            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            return uniqueName;

        } catch (IOException e) {
            throw new FileStorageException("Could not store logo file " + originalFilename, e);
        }
    }

    public void deleteFileFromDisk(String storedPath){
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }
        try {
            Path filePath = resolvePath(storedPath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            logger.error("Failed to delete file from disk: {}. Error: {}", storedPath, e.getMessage());
        }
    }
}
