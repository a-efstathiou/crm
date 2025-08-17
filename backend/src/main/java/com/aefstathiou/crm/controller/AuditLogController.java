package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.AuditLogDTO;
import com.aefstathiou.crm.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets/{ticketId}/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs(@PathVariable Long ticketId) {
        return ResponseEntity.ok(auditLogService.getAuditLogsForTicket(ticketId));
    }
}
