package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.dto.DashboardStatsDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats(Principal principal) {
        return ResponseEntity.ok(dashboardService.getStatsForUser(principal));
    }

    @GetMapping("/actionable-tickets")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SupportTicketDTO>> getActionableTickets(Principal principal) {
        return ResponseEntity.ok(dashboardService.getActionableTickets(principal));
    }
}
