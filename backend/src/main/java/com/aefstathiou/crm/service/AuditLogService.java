package com.aefstathiou.crm.service;

import com.aefstathiou.crm.dto.AuditLogDTO;
import com.aefstathiou.crm.mapper.AuditLogDTOMapper;
import com.aefstathiou.crm.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogDTOMapper auditLogDTOMapper;

    public List<AuditLogDTO> getAuditLogsForTicket(Long ticketId) {
        return auditLogRepository.findBySupportTicketIdOrderByTimestampDesc(ticketId)
                .stream()
                .map(auditLogDTOMapper)
                .collect(Collectors.toList());
    }

}
