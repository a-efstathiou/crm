package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long>, JpaSpecificationExecutor<SupportTicket> {

    long countByRequesterAndStatusNotIn(User user, List<Status> statusList);

    long countByRequesterAndStatus(User user, Status status);

    Long countByAssignedToAndStatusNotIn(User user, List<Status> statusList);

    Long countByAssignedToIsNull();

    long countByStatusNotIn(List<Status> statusList);

    Long countByResolvedAtAfter(LocalDateTime localDateTime);

    List<SupportTicket> findTop5ByRequesterOrderByUpdatedAtDesc(User requester);

    List<SupportTicket> findTop10ByAssignedToAndStatusInOrderByPriorityDescUpdatedAtAsc(User assignee, List<Status> activeStatuses);

    List<SupportTicket> findTop10ByAssignedToIsNullAndStatusIsOrderByCreatedAtAsc(Status status);

    List<SupportTicket> findAllByStatusAndResolvedAtBefore(Status status, LocalDateTime threshold);
}
