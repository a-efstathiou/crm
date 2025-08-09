package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.model.SupportRequest;
import com.aefstathiou.crm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {

    // Find all by requester (Customer)
    List<SupportRequest> findByRequester(User requester);

    // Find all by status (NEW, IN_PROGRESS, etc.)
    List<SupportRequest> findByStatus(Status status);

    // Find all by requester and status
    List<SupportRequest> findByRequesterAndStatus(User requester, Status status);

    // If you want to get requests assigned to a specific support agent
    List<SupportRequest> findByAssignedTo(User assignedTo);
}
