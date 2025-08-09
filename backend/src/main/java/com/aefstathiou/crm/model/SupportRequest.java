package com.aefstathiou.crm.model;

import com.aefstathiou.crm.enums.Category;
import com.aefstathiou.crm.enums.Priority;
import com.aefstathiou.crm.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "support_requests")
@Getter
@Setter
public class SupportRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="support_request_id")
    private Long id;
    @Column(columnDefinition="TEXT")
    private String description;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;
    @Enumerated(EnumType.STRING) private Status status = Status.NEW;
    @Enumerated(EnumType.STRING) private Priority priority = Priority.MEDIUM;
    @Enumerated(EnumType.STRING) private Category category = Category.OTHER;

    private LocalDateTime slaDueAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "supportRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

}
