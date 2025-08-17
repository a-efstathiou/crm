package com.aefstathiou.crm.listener;

import com.aefstathiou.crm.event.AttachmentAddedEvent;
import com.aefstathiou.crm.event.TicketCreatedEvent;
import com.aefstathiou.crm.event.TicketUpdatedEvent; // We will create this next
import com.aefstathiou.crm.model.AuditLog;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.AuditLogRepository;
import com.aefstathiou.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuditEventListener.class);

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleTicketCreation(TicketCreatedEvent event) {
        saveAuditLog("CREATE", event.ticket(), "Ticket was created.");
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleTicketUpdate(TicketUpdatedEvent event) {
        saveAuditLog("UPDATE", event.ticket(), event.details());
    }

    @TransactionalEventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleAttachmentAdded(AttachmentAddedEvent event) {
        String details = "Added new attachment(s): " + String.join(", ", event.newFileNames());
        saveAuditLog("UPDATE", event.ticket(), details);
    }

    private void saveAuditLog(String action, SupportTicket ticket, String details) {
        User actor = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            String userEmail = authentication.getName();
            actor = userRepository.findByEmail(userEmail).orElse(null);
        }

        AuditLog log = AuditLog.builder()
                .supportTicket(ticket)
                .actor(actor)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();

        assert auditLogRepository != null;
        auditLogRepository.save(log);
    }
}