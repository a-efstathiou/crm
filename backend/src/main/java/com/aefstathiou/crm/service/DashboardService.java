package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.DashboardStatsDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.mapper.SupportTicketDTOMapper;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.*;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SupportTicketDTOMapper supportTicketDTOMapper;

    public DashboardStatsDTO getStatsForUser(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Role role = user.getRole();

        DashboardStatsDTO.DashboardStatsDTOBuilder stats = DashboardStatsDTO.builder();

        if (role == Role.CUSTOMER) {
            stats.openTickets(ticketRepository.countByRequesterAndStatusNotIn(user, List.of(Status.RESOLVED, Status.CLOSED)));
            stats.resolvedTickets(ticketRepository.countByRequesterAndStatus(user, Status.RESOLVED));
        }
        else if (role == Role.SUPPORT_AGENT) {
            stats.ticketsAssignedToMe(ticketRepository.countByAssignedToAndStatusNotIn(user, List.of(Status.RESOLVED, Status.CLOSED)));
            stats.unassignedTickets(ticketRepository.countByAssignedToIsNull());
        }
        else if (role == Role.SUPERVISOR || role == Role.ADMIN) {
            stats.openTickets(ticketRepository.countByStatusNotIn(List.of(Status.RESOLVED, Status.CLOSED)));
            stats.unassignedTickets(ticketRepository.countByAssignedToIsNull());
            stats.ticketsClosedToday(ticketRepository.countByResolvedAtAfter(LocalDateTime.now().minusDays(1)));

            stats.ticketsByStatus(ticketRepository.findAll().stream()
                    .collect(Collectors.groupingBy(t -> t.getStatus().toString(), Collectors.counting())));
        }

        return stats.build();
    }

    public List<SupportTicketDTO> getActionableTickets(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Role role = user.getRole();

        List<SupportTicket> tickets = switch (role) {
            case CUSTOMER -> ticketRepository.findTop5ByRequesterOrderByUpdatedAtDesc(user);
            case SUPPORT_AGENT -> {
                List<Status> activeStatuses = List.of(Status.NEW, Status.OPEN, Status.IN_PROGRESS, Status.WAITING_CUSTOMER);
                yield ticketRepository.findTop10ByAssignedToAndStatusInOrderByPriorityDescUpdatedAtAsc(user, activeStatuses);
            }
            case SUPERVISOR, ADMIN ->
                    ticketRepository.findTop10ByAssignedToIsNullAndStatusIsOrderByCreatedAtAsc(Status.NEW);
        };

        return tickets.stream()
                .map(supportTicketDTOMapper)
                .collect(Collectors.toList());
    }
}