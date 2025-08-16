package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.dto.request.SupportTicketCreateRequest;
import com.aefstathiou.crm.dto.request.SupportTicketUpdateRequest;
import com.aefstathiou.crm.dto.request.TicketCommentRequest;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.mapper.AttachmentDTOMapper;
import com.aefstathiou.crm.mapper.SupportTicketDTOMapper;
import com.aefstathiou.crm.model.Attachment;
import com.aefstathiou.crm.model.Category;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.AttachmentRepository;
import com.aefstathiou.crm.repository.CategoryRepository;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final SupportTicketDTOMapper supportTicketDTOMapper;
    private final AttachmentDTOMapper attachmentDTOMapper;
    private final AttachmentService attachmentService;
    private final CategoryRepository categoryRepository;

    @Transactional
    public SupportTicketDTO create(SupportTicketCreateRequest req, List<MultipartFile> files, Principal principal) {
        User requester = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        User assignedTo = null;
        if (req.assignedToId() != null) {
            assignedTo = userRepository.findById(req.assignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + req.assignedToId()));
        }

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + req.categoryId()));

        SupportTicket ticket = new SupportTicket();

        ticket.setSubject(req.subject());
        ticket.setDescription(req.description());
        ticket.setRequester(requester);
        ticket.setAssignedTo(assignedTo);
        ticket.setPriority(req.priority());
        ticket.setCategory(category);
        ticket.setStatus(Status.NEW);

        SupportTicket savedSupportTicket = supportTicketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            SaveAttachments(files, savedSupportTicket,principal);
        }

        return supportTicketDTOMapper.apply(savedSupportTicket);
    }

    private void SaveAttachments(List<MultipartFile> files, SupportTicket savedSupportTicket, Principal principal) {
        for (MultipartFile mf : files) {
            if (mf.isEmpty()) continue;
            attachmentService.storeFile(savedSupportTicket.getId(),mf,principal);
        }
    }

    @Transactional
    public SupportTicketDTO getById(Long id) {
        return supportTicketDTOMapper.apply(
                supportTicketRepository.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + id))
        );
    }

    @Transactional
    public Page<SupportTicketDTO> list(Status status, Long requesterId, Long assignedToId, Pageable pageable) {
        if (status != null && requesterId != null) {
            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new EntityNotFoundException("Requester not found: " + requesterId));
            return supportTicketRepository.findByRequesterAndStatus(requester, status, pageable).map(supportTicketDTOMapper);
        }
        if (status != null) {
            return supportTicketRepository.findByStatus(status, pageable).map(supportTicketDTOMapper);
        }
        if (requesterId != null) {
            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new EntityNotFoundException("Requester not found: " + requesterId));
            return supportTicketRepository.findByRequester(requester, pageable).map(supportTicketDTOMapper);
        }
        if (assignedToId != null) {
            User assignedTo = userRepository.findById(assignedToId)
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + assignedToId));
            return supportTicketRepository.findByAssignedTo(assignedTo, pageable).map(supportTicketDTOMapper);
        }
        return supportTicketRepository.findAll(pageable).map(supportTicketDTOMapper);
    }

    @Transactional
    public SupportTicketDTO update(Long id, SupportTicketUpdateRequest req) {
        SupportTicket t = supportTicketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + id));

        Status oldStatus = t.getStatus();

        if (req.categoryId() != null){
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + req.categoryId()));
            if (!category.isActive()) {
                throw new IllegalArgumentException("Cannot assign a ticket to an inactive category.");
            }
            t.setCategory(category);
        }
        if (req.subject() != null) t.setSubject(req.subject());
        if (req.status() != null) t.setStatus(req.status());
        if (req.priority() != null) t.setPriority(req.priority());
        if (req.assignedToId() != null) {
            User assignedTo = userRepository.findById(req.assignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + req.assignedToId()));
            t.setAssignedTo(assignedTo);
        }

        Status newStatus = req.status();

        if (newStatus != null) {
            if (oldStatus == Status.NEW) {
                t.setStatus(Status.OPEN);
            } else {
                t.setStatus(newStatus);
            }

            boolean isNowResolved = (newStatus == Status.RESOLVED || newStatus == Status.CLOSED);
            boolean wasNotResolvedBefore = (oldStatus != Status.RESOLVED && oldStatus != Status.CLOSED);

            if (isNowResolved && wasNotResolvedBefore) {
                t.setResolvedAt(LocalDateTime.now());
            }

            boolean isReopened = (!isNowResolved && !wasNotResolvedBefore);
            if (isReopened) {
                t.setResolvedAt(null);
            }
        }

        return supportTicketDTOMapper.apply(supportTicketRepository.save(t));
    }

    @Transactional
    public void delete(Long id) {
        if (!supportTicketRepository.existsById(id)) {
            throw new EntityNotFoundException("Ticket not found: " + id);
        }
        supportTicketRepository.deleteById(id);
    }

    @Transactional
    public List<AttachmentDTO> addAttachments(Long ticketId, List<MultipartFile> files, Principal principal) {
        SupportTicket supportTicket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        SaveAttachments(files, supportTicket, principal);

        return supportTicket.getAttachments().stream().map(attachmentDTOMapper).toList();
    }

    @Transactional
    public SupportTicketDTO addCustomerReply(Long ticketId, TicketCommentRequest request, Principal principal) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found: " + ticketId));

        User customer = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!ticket.getRequester().getId().equals(customer.getId())) {
            throw new ForbiddenException("You do not have permission to comment on this ticket.");
        }

        if (ticket.getStatus() == Status.WAITING_CUSTOMER || ticket.getStatus() == Status.RESOLVED) {
            ticket.setStatus(Status.IN_PROGRESS); // Or you could use 'OPEN'
            ticket.setResolvedAt(null); // Clear resolved timestamp if it was resolved
        }

        // Here you would also have logic to create and save a new Comment entity
        // Comment comment = new Comment(request.content(), ticket, customer);
        // commentRepository.save(comment);

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);
        return supportTicketDTOMapper.apply(updatedTicket);
    }
}
