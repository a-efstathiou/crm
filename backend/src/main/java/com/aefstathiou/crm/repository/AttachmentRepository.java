package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findBySupportTicket_Id(Long supportRequestId);
}
