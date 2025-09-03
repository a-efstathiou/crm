import api from './api';

const getTickets = (page, size, filters, sortField, sortDir) => {
    const params = {
        page,
        size,
        ...filters,
        sort: `${sortField},${sortDir}`,
    };
    return api.get('/v1/tickets', { params });
};

const getTicketById = (ticketId) => {
    return api.get(`/v1/tickets/${ticketId}`);
};

const createTicketAsCustomer = (ticketData, files) => {
    const formData = new FormData();
    const ticketBlob = new Blob([JSON.stringify(ticketData)], { type: 'application/json' });
    formData.append('ticket', ticketBlob);

    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('attachments', file);
        });
    }

    return api.post('/v1/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const createTicketOnBehalfOf = (ticketData, files) => {
    const formData = new FormData();
    const ticketBlob = new Blob([JSON.stringify(ticketData)], { type: 'application/json' });
    formData.append('ticket', ticketBlob);

    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('attachments', file);
        });
    }

    return api.post('/v1/tickets/on-behalf-of', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const updateTicket = (ticketId, updateData) => {
    return api.patch(`/v1/tickets/${ticketId}`, updateData);
};

const getComments = (ticketId) => {
    return api.get(`/v1/tickets/${ticketId}/comments`);
};

const addComment = (ticketId, commentData) => {
    return api.post(`/v1/tickets/${ticketId}/comments`, commentData);
};

const addAttachments = (ticketId, files) => {
    const formData = new FormData();
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('attachments', file);
        });
    }
    return api.post(`/v1/tickets/${ticketId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const ticketService = {
    getTickets,
    getTicketById,
    createTicketAsCustomer,
    createTicketOnBehalfOf,
    updateTicket,
    getComments,
    addComment,
    addAttachments,
};

export default ticketService;