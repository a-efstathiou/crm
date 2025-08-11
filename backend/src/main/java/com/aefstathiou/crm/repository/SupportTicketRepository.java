package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Page<SupportTicket> findByStatus(Status status, Pageable pageable);
    Page<SupportTicket> findByRequester(User requester, Pageable pageable);
    Page<SupportTicket> findByAssignedTo(User assignedTo, Pageable pageable);
    Page<SupportTicket> findByRequesterAndStatus(User requester, Status status, Pageable pageable);

    Page<SupportTicket> findByRequester_Id(Long requesterId, Pageable pageable);
    Page<SupportTicket> findByAssignedTo_Id(Long assignedToId, Pageable pageable);
    Page<SupportTicket> findByRequester_IdAndStatus(Long requesterId, Status status, Pageable pageable);
}
