package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.AuditLogDTO;
import com.aefstathiou.crm.model.AuditLog;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class AuditLogDTOMapper implements Function<AuditLog, AuditLogDTO> {
    @Override
    public AuditLogDTO apply(AuditLog auditLog) {
        return new AuditLogDTO(
                auditLog.getId(),
                auditLog.getActor().getFullName(),
                auditLog.getAction(),
                auditLog.getDetails(),
                auditLog.getTimestamp()
        );
    }
}
