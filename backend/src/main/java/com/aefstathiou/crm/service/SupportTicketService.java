package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.AttachmentDTO;
import com.aefstathiou.crm.dto.SupportTicketDTO;
import com.aefstathiou.crm.dto.request.AgentTicketCreateRequest;
import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.event.AttachmentAddedEvent;
import com.aefstathiou.crm.event.TicketCreatedEvent;
import com.aefstathiou.crm.event.TicketUpdatedEvent;
import com.aefstathiou.crm.dto.request.CustomerTicketCreateRequest;
import com.aefstathiou.crm.dto.request.SupportTicketUpdateRequest;
import com.aefstathiou.crm.dto.request.TicketCommentRequest;
import com.aefstathiou.crm.enums.Status;
import com.aefstathiou.crm.exception.FileStorageException;
import com.aefstathiou.crm.exception.ForbiddenException;
import com.aefstathiou.crm.mapper.AttachmentDTOMapper;
import com.aefstathiou.crm.mapper.SupportTicketDTOMapper;
import com.aefstathiou.crm.model.Attachment;
import com.aefstathiou.crm.model.Category;
import com.aefstathiou.crm.model.SupportTicket;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.CategoryRepository;
import com.aefstathiou.crm.repository.SupportTicketRepository;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.specification.SupportTicketSpecification;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final SupportTicketDTOMapper supportTicketDTOMapper;
    private final AttachmentDTOMapper attachmentDTOMapper;
    private final AttachmentService attachmentService;
    private final CategoryRepository categoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private static final Logger logger = LoggerFactory.getLogger(SupportTicketService.class);

    @Transactional
    public SupportTicketDTO createTicketAsCustomer(CustomerTicketCreateRequest req, List<MultipartFile> files, Principal principal) {
        User requester = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found"));

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + req.categoryId()));

        SupportTicket ticket = new SupportTicket();

        ticket.setSubject(req.subject());
        ticket.setDescription(req.description());
        ticket.setRequester(requester);
        ticket.setPriority(req.priority());
        ticket.setCategory(category);
        ticket.setStatus(Status.NEW);

        SupportTicket savedSupportTicket = supportTicketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            SaveAttachments(files, savedSupportTicket, principal);
        }

        eventPublisher.publishEvent(new TicketCreatedEvent(savedSupportTicket));

        return supportTicketDTOMapper.apply(savedSupportTicket);
    }

    @Transactional
    public SupportTicketDTO createTicketOnBehalfOfCustomer(AgentTicketCreateRequest req, List<MultipartFile> files, Principal agentprincipal) {

        User requester = userRepository.findById(req.requesterId())
                .orElseThrow(() -> new EntityNotFoundException("Requester (customer) not found with ID: " + req.requesterId()));

        if (requester.getRole() != Role.CUSTOMER) {
            throw new IllegalArgumentException("Tickets can only be created on behalf of users with the CUSTOMER role.");
        }

        Category category = categoryRepository.findById(req.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + req.categoryId()));

        SupportTicket ticket = new SupportTicket();

        if (req.assignedToId() != null) {
            User assignedTo = userRepository.findById(req.assignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Agent not found with ID: " + req.requesterId()));
            ticket.setAssignedTo(assignedTo);
        }

        ticket.setSubject(req.subject());
        ticket.setDescription(req.description());
        ticket.setRequester(requester);
        ticket.setPriority(req.priority());
        ticket.setCategory(category);
        ticket.setStatus(Status.NEW);

        SupportTicket savedSupportTicket = supportTicketRepository.save(ticket);

        if (files != null && !files.isEmpty()) {
            logger.info("trying to save attachments 2");
            SaveAttachments(files, savedSupportTicket, agentprincipal);
        }

        eventPublisher.publishEvent(new TicketCreatedEvent(savedSupportTicket));

        return supportTicketDTOMapper.apply(savedSupportTicket);
    }

    private List<Attachment> SaveAttachments(List<MultipartFile> files, SupportTicket savedSupportTicket, Principal principal) {
        List<Attachment> savedAttachments = new ArrayList<>();

        try {
            for (MultipartFile mf : files) {
                if (mf.isEmpty()) continue;
                Attachment attachment = attachmentService.storeFile(savedSupportTicket.getId(), mf, principal);
                savedAttachments.add(attachment);
            }
            return savedAttachments;
        } catch (Exception e) {
            for (Attachment attachment : savedAttachments) {
                attachmentService.deleteFileFromDisk(attachment.getFilePath());
            }
            logger.error(e.getMessage());
            throw new FileStorageException(e.getMessage(), e);
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
    public Page<SupportTicketDTO> list(
            String subject,
            Priority priority,
            Status status,
            Long requesterId,
            Long assignedToId,
            Pageable pageable
    ) {
        Specification<SupportTicket> finalSpec = null;

        finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.subjectContains(subject));
        finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.hasStatus(status));
        finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.hasPriority(priority));

        if (requesterId != null) {
            User requester = userRepository.findById(requesterId)
                    .orElseThrow(() -> new EntityNotFoundException("Requester not found: " + requesterId));
            finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.hasRequester(requester));
        }

        if (assignedToId != null) {
            if (assignedToId == -1L) {
                finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.isUnassigned());
            } else {
                User assignedTo = userRepository.findById(assignedToId)
                        .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + assignedToId));
                finalSpec = addAndSpecification(finalSpec, SupportTicketSpecification.hasAssignedTo(assignedTo));
            }
        }

        return supportTicketRepository.findAll(finalSpec, pageable).map(supportTicketDTOMapper);
    }

    @Transactional
    public SupportTicketDTO update(Long id, SupportTicketUpdateRequest req, Principal principal) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with ID: " + id));

        Map<String, Object> beforeState = new HashMap<>();
        beforeState.put("status", ticket.getStatus());
        beforeState.put("priority", ticket.getPriority());
        beforeState.put("assignee", ticket.getAssignedTo());
        beforeState.put("category", ticket.getCategory());
        beforeState.put("subject", ticket.getSubject());

        if (req.subject() != null) {
            ticket.setSubject(req.subject());
        }
        if (req.priority() != null) {
            ticket.setPriority(req.priority());
        }
        if (req.categoryId() != null) {
            Category category = categoryRepository.findById(req.categoryId())
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + req.categoryId()));
            if (!category.isActive()) {
                throw new IllegalArgumentException("Cannot assign a ticket to an inactive category.");
            }
            ticket.setCategory(category);
        }
        if (req.assignedToId() != null) {
            User assignedTo = userRepository.findById(req.assignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assignee not found with ID: " + req.assignedToId()));
            ticket.setAssignedTo(assignedTo);
        }

        if (req.status() != null) {
            Status oldStatus = (Status) beforeState.get("status");
            Status newStatus = req.status();

            ticket.setStatus(newStatus);

            boolean isNowResolved = (newStatus == Status.RESOLVED || newStatus == Status.CLOSED);
            boolean wasNotResolvedBefore = (oldStatus != Status.RESOLVED && oldStatus != Status.CLOSED);

            if (isNowResolved && wasNotResolvedBefore) {
                ticket.setResolvedAt(LocalDateTime.now());
            }

            if (!isNowResolved && !wasNotResolvedBefore) {
                ticket.setResolvedAt(null);
            }
        }

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        String details = buildAuditDetails(beforeState, updatedTicket);
        if (!details.isEmpty()) {
            eventPublisher.publishEvent(new TicketUpdatedEvent(details, updatedTicket));
        }

        return supportTicketDTOMapper.apply(updatedTicket);
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

        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new EntityNotFoundException("Current user not found"));

        canUserAccessTicket(supportTicket, currentUser);

        List<String> attachmentNames = SaveAttachments(files, supportTicket, principal)
                .stream()
                .map(Attachment::getFileName)
                .toList();

        eventPublisher.publishEvent(new AttachmentAddedEvent(supportTicket, attachmentNames));

        return supportTicket.getAttachments().stream().map(attachmentDTOMapper).toList();
    }

    private String buildAuditDetails(Map<String, Object> beforeState, SupportTicket afterState) {
        StringBuilder details = new StringBuilder();

        if (!Objects.equals(beforeState.get("status"), afterState.getStatus())) {
            details.append("Changed status from '").append(beforeState.get("status")).append("' to '").append(afterState.getStatus()).append("'. ");
        }
        if (!Objects.equals(beforeState.get("priority"), afterState.getPriority())) {
            details.append("Changed priority from '").append(beforeState.get("priority")).append("' to '").append(afterState.getPriority()).append("'. ");
        }
        if (!Objects.equals(beforeState.get("assignee"), afterState.getAssignedTo())) {
            String oldAssignee = beforeState.get("assignee") != null ? ((User) beforeState.get("assignee")).getFullName() : "Unassigned";
            String newAssignee = afterState.getAssignedTo() != null ? afterState.getAssignedTo().getFullName() : "Unassigned";
            details.append("Changed assignee from '").append(oldAssignee).append("' to '").append(newAssignee).append("'. ");
        }
        if (!Objects.equals(beforeState.get("category"), afterState.getCategory())) {
            String oldCategory = beforeState.get("category") != null ? ((Category) beforeState.get("category")).getName() : "None";
            String newCategory = afterState.getCategory() != null ? afterState.getCategory().getName() : "None";
            details.append("Changed category from '").append(oldCategory).append("' to '").append(newCategory).append("'. ");
        }
        if (!Objects.equals(beforeState.get("subject"), afterState.getSubject())) {
            details.append("Changed subject to '").append(afterState.getSubject()).append("'. ");
        }

        return details.toString().trim();
    }

    private void canUserAccessTicket(SupportTicket ticket, User user) {
        Role userRole = user.getRole();

        if (userRole == Role.SUPPORT_AGENT || userRole == Role.SUPERVISOR || userRole == Role.ADMIN) {
            return;
        }

        if (userRole == Role.CUSTOMER) {
            if (ticket.getRequester().getId().equals(user.getId())) {
                return;
            }
        }

        throw new ForbiddenException("You do not have permission to access this ticket.");
    }

    private Specification<SupportTicket> addAndSpecification(Specification<SupportTicket> baseSpec, Specification<SupportTicket> newSpec) {
        if (newSpec == null) {
            return baseSpec;
        }
        if (baseSpec == null) {
            return newSpec;
        }
        return baseSpec.and(newSpec);
    }
}
