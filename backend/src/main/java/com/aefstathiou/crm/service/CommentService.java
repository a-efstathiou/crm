package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.CommentDTO;
import com.aefstathiou.crm.dto.request.CommentCreateRequest;
import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.mapper.CommentDTOMapper;
import com.aefstathiou.crm.model.Comment;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.CommentRepository;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final SupportTicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CommentDTOMapper commentDTOMapper;

    @Transactional
    public CommentDTO createComment(Long ticketId, CommentCreateRequest request, Principal principal) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        if (ticket.getStatus() == Status.CLOSED) {
            throw new IllegalStateException("Cannot add comments to a closed ticket.");
        }
        
        User author = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        canUserComment(ticket, author);

        Comment comment = new Comment();
        comment.setContent(request.content());
        comment.setSupportTicket(ticket);
        comment.setAuthor(author);

        boolean isInternal = false;

        if (author.getRole() == Role.CUSTOMER) {

            if (ticket.getStatus() == Status.WAITING_CUSTOMER || ticket.getStatus() == Status.RESOLVED) {
                ticket.setStatus(Status.IN_PROGRESS);
                ticket.setResolvedAt(null);
            }
        } else {
            isInternal = (request.isInternalNote() != null && request.isInternalNote());

            if (ticket.getAssignedTo() == null) {
                ticket.setAssignedTo(author);
            }

            if (ticket.getStatus() == Status.NEW || ticket.getStatus() == Status.OPEN) {
                ticket.setStatus(Status.IN_PROGRESS);
            }
        }

        comment.setInternalNote(isInternal);

        Comment savedComment = commentRepository.save(comment);
        ticketRepository.save(ticket);

        return commentDTOMapper.apply(savedComment);
    }

    public List<CommentDTO> getCommentsForTicket(Long ticketId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Comment> comments = commentRepository.findBySupportTicketIdOrderByCreatedAtAsc(ticketId);

        if (user.getRole() == Role.CUSTOMER) {
            return comments.stream()
                    .filter(comment -> !comment.isInternalNote())
                    .map(commentDTOMapper)
                    .collect(Collectors.toList());
        }

        return comments.stream()
                .map(commentDTOMapper)
                .collect(Collectors.toList());
    }

    private void canUserComment(SupportTicket ticket, User user) {
        if (user.getRole() != Role.CUSTOMER) {
            return;
        }
        if (!ticket.getRequester().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have permission to comment on this ticket.");
        }
    }
}
