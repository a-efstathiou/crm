import api from './api';

const getTickets = (page, size, filters) => {
    const params = { page, size, ...filters };
    return api.get('/v1/tickets', { params });
};

const getTicketById = (ticketId) => {
    return api.get(`/v1/tickets/${ticketId}`);
};

const createTicket = (ticketData, files) => {
    const formData = new FormData();

    const ticketBlob = new Blob([JSON.stringify(ticketData)], { type: 'application/json' });
    formData.append('request', ticketBlob);

    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    return api.post('/v1/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const updateTicket = (ticketId, updateData) => {
    return api.put(`/v1/tickets/${ticketId}`, updateData);
};

const getComments = (ticketId) => {
    return api.get(`/v1/tickets/${ticketId}/comments`);
};

const addComment = (ticketId, commentData) => {
    return api.post(`/v1/tickets/${ticketId}/comments`, commentData);
};

const ticketService = {
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    getComments,
    addComment
};

export default ticketService;