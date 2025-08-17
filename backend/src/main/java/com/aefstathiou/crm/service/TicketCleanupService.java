package com.aefstathiou.crm.service;

import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.event.TicketUpdatedEvent;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketCleanupService {
    private final SupportTicketRepository ticketRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void autoCloseResolvedTickets() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(3);
        List<SupportTicket> ticketsToClose = ticketRepository.findAllByStatusAndResolvedAtBefore(Status.RESOLVED, threshold);

        for (SupportTicket ticket : ticketsToClose) {
            String details = "Ticket auto-closed after 3 days in Resolved state.";

            ticket.setStatus(Status.CLOSED);

            eventPublisher.publishEvent(new TicketUpdatedEvent(details, ticket));
        }
        ticketRepository.saveAll(ticketsToClose);
    }
}