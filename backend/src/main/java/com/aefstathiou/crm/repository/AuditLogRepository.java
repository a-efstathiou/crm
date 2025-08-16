package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findBySupportTicketIdOrderByTimestampDesc(Long ticketId);
}