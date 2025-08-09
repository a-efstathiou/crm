package com.aefstathiou.crm.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="attachment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="support_request_id", nullable=false)
    private SupportRequest supportRequest;

    private String fileName;
    private String mimeType;
    private String filePath; // e.g. "/uploads/2025/08/filename.pdf"

    private Long sizeBytes;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
    private LocalDateTime uploadedAt;
}

