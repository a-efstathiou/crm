import api from './api';

const getAuditLogs = (ticketId) => {
    return api.get(`/v1/tickets/${ticketId}/audit-logs`);
};

const auditLogService = {
    getAuditLogs,
};

export default auditLogService;