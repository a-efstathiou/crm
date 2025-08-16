package com.aefstathiou.crm.listener;

import com.aefstathiou.crm.model.Category;
import com.aefstathiou.crm.model.AuditLog;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.AuditLogRepository;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.service.UserService;
import com.aefstathiou.crm.util.BeanUtil;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import jakarta.persistence.PreUpdate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import static org.springframework.transaction.annotation.Propagation.REQUIRES_NEW;

public class TicketEntityListener {

    private static final ThreadLocal<Map<String, Object>> beforeUpdateState = new ThreadLocal<>();

    @PostPersist
    @Transactional(propagation = REQUIRES_NEW)
    public void afterCreate(SupportTicket ticket) {
        saveAuditLog("CREATE", ticket, "Ticket was created.");
    }

    @PreUpdate
    public void beforeUpdate(SupportTicket ticket) {
        Map<String, Object> state = new HashMap<>();
        state.put("status", ticket.getStatus());
        state.put("priority", ticket.getPriority());
        state.put("assignee", ticket.getAssignedTo());
        beforeUpdateState.set(state);
    }

    @PostUpdate
    @Transactional(propagation = REQUIRES_NEW)
    public void afterUpdate(SupportTicket ticket) {
        StringBuilder details = new StringBuilder();
        Map<String, Object> beforeState = beforeUpdateState.get();

        if (beforeState != null) {
            if (!Objects.equals(beforeState.get("status"), ticket.getStatus())) {
                details.append("Changed status from '").append(beforeState.get("status")).append("' to '").append(ticket.getStatus()).append("'. ");
            }
            if (!Objects.equals(beforeState.get("subject"), ticket.getSubject())) {
                details.append("Changed subject from '").append(beforeState.get("subject")).append("' to '").append(ticket.getPriority()).append("'. ");
            }
            if (!Objects.equals(beforeState.get("priority"), ticket.getPriority())) {
                details.append("Changed priority from '").append(beforeState.get("priority")).append("' to '").append(ticket.getPriority()).append("'. ");
            }
            if (!Objects.equals(beforeState.get("assignee"), ticket.getAssignedTo())) {
                String oldAssignee = beforeState.get("assignee") != null ? ((User) beforeState.get("assignee")).getFullName() : "Unassigned";
                String newAssignee = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : "Unassigned";
                details.append("Changed assignee from '").append(oldAssignee).append("' to '").append(newAssignee).append("'. ");
            }
            if (!Objects.equals(beforeState.get("category"), ticket.getCategory())) {
                String oldCategory = beforeState.get("category") != null ? ((Category) beforeState.get("category")).getName() : "None";
                String newCategory = ticket.getCategory() != null ? ticket.getCategory().getName() : "None";
                details.append("Changed category from '").append(oldCategory).append("' to '").append(newCategory).append("'. ");
            }

            // Compare Subject
            if (!Objects.equals(beforeState.get("subject"), ticket.getSubject())) {
                details.append("Changed subject to '").append(ticket.getSubject()).append("'. ");
            }
        }

        if (!details.isEmpty()) {
            saveAuditLog("UPDATE", ticket, details.toString().trim());
        }
        beforeUpdateState.remove();
    }

    private void saveAuditLog(String action, SupportTicket ticket, String details) {
        AuditLogRepository auditLogRepository = BeanUtil.getBean(AuditLogRepository.class);
        UserRepository userRepository = BeanUtil.getBean(UserRepository.class);

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

        auditLogRepository.save(log);
    }
}