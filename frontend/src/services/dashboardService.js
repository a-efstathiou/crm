import api from './api';

const getStats = () => {
    return api.get('/v1/dashboard/stats');
};

const getActionableTickets = () => {
    return api.get('/v1/dashboard/actionable-tickets');
};

const dashboardService = {
    getStats,
    getActionableTickets,
};

export default dashboardService;