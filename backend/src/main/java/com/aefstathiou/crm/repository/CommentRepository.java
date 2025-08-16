package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findBySupportTicketIdOrderByCreatedAtAsc(Long ticketId);
}
