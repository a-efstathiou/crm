package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.ApplicationSettingsDTO;
import com.aefstathiou.crm.dto.request.ApplicationSettingsUpdateRequest;
import com.aefstathiou.crm.exception.GlobalExceptionHandler;
import com.aefstathiou.crm.model.ApplicationSettings;
import com.aefstathiou.crm.service.ApplicationSettingsService;
import com.aefstathiou.crm.service.AttachmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping(path = "api/v1/settings")
@AllArgsConstructor
public class ApplicationSettingsController {

    private final ApplicationSettingsService applicationSettingsService;
    private final AttachmentService attachmentService;
    private static final Logger logger = LoggerFactory.getLogger(ApplicationSettingsController.class);

    @GetMapping("/application")
    public ResponseEntity<ApplicationSettingsDTO> getApplicationSettings() {
        return ResponseEntity.ok(applicationSettingsService.getApplicationSettings());
    }

    @PutMapping("/application")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationSettingsDTO> updateApplicationSettings(
            @RequestBody @Valid ApplicationSettingsUpdateRequest settingsDto
    ) {
        return ResponseEntity.ok(applicationSettingsService.updateApplicationSettings(settingsDto));
    }

    @PostMapping("/logo-upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadLogo(@RequestParam("logoFile") MultipartFile file) {
        String logoPath = attachmentService.storeLogo(file);

        applicationSettingsService.updateLogoUrl(logoPath);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/logo")
    public ResponseEntity<Resource> getLogo() {
        Resource logoAsResource = applicationSettingsService.getLogoAsResource();

        if (logoAsResource == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "application/octet-stream";
        try {
            String determinedContentType = Files.probeContentType(logoAsResource.getFile().toPath());
            if (determinedContentType != null) {
                contentType = determinedContentType;
            }
        } catch (Exception ex) {
            logger.error("Could not determine file type for logo: {}", logoAsResource.getFilename());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + logoAsResource.getFilename() + "\"")
                .body(logoAsResource);
    }

}
