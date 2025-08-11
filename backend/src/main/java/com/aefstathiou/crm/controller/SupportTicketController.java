package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.dto.request.SupportTicketCreateRequest;
import com.aefstathiou.crm.dto.request.SupportTicketUpdateRequest;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public SupportTicketDTO create(
            @Valid @RequestPart("ticket") SupportTicketCreateRequest ticket,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            Principal principal
    ) {
        return supportTicketService.create(ticket, attachments, principal);
    }

    @GetMapping("/{id}")
    public SupportTicketDTO getById(@PathVariable Long id) {
        return supportTicketService.getById(id);
    }

    @GetMapping
    public Page<SupportTicketDTO> list(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) Long assignedToId,
            Pageable pageable
    ) {
        return supportTicketService.list(status, requesterId, assignedToId, pageable);
    }

    @PatchMapping("/{id}")
    public SupportTicketDTO update(
            @PathVariable Long id,
            @Valid @RequestBody SupportTicketUpdateRequest update
    ) {
        return supportTicketService.update(id, update);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        supportTicketService.delete(id);
    }

    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<AttachmentDTO> addAttachments(
            @PathVariable Long id,
            @RequestPart("attachments") List<MultipartFile> attachments,
            Principal principal) {
        return supportTicketService.addAttachments(id, attachments, principal);
    }
}
