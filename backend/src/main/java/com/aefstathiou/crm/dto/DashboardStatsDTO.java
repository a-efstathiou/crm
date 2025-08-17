package com.aefstathiou.crm.dto;

import lombok.Builder;

import java.util.Map;

@Builder
public record DashboardStatsDTO(
        long openTickets,
        long resolvedTickets,
        Long ticketsAssignedToMe,
        Long unassignedTickets,
        Long ticketsClosedToday,
        Map<String, Long> ticketsByStatus
) { }
