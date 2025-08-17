package com.aefstathiou.crm.specification;

import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SupportTicketSpecification {

    public static Specification<SupportTicket> subjectContains(String subject) {
        if (subject == null || subject.isBlank()) return null;
        return (root, query, cb) -> cb.like(cb.lower(root.get("subject")), "%" + subject.toLowerCase() + "%");
    }

    public static Specification<SupportTicket> hasStatus(Status status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<SupportTicket> hasPriority(Priority priority) {
        if (priority == null) return null;
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<SupportTicket> hasRequester(User requester) {
        if (requester == null) return null;
        return (root, query, cb) -> cb.equal(root.get("requester"), requester);
    }

    public static Specification<SupportTicket> hasAssignedTo(User assignee) {
        if (assignee == null) return null;
        return (root, query, cb) -> cb.equal(root.get("assignedTo"), assignee);
    }

    public static Specification<SupportTicket> isUnassigned() {
        return (root, query, cb) -> cb.isNull(root.get("assignedTo"));
    }

}
