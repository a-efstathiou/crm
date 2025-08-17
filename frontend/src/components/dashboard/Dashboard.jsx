import React, { useState, useEffect, useContext } from 'react';
import {Container, Row, Col, Card, Spinner, Button} from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UserContext } from '../common/UserContext.jsx';
import dashboardService from '../../services/dashboardService.js';
import ActionableTicketsWidget from '../dashboard/ActionableTicketsWidget';
import { toast } from 'react-toastify';
import {LinkContainer} from "react-router-bootstrap";

const StatCard = ({ title, value, icon, color }) => (
    <Card className="text-center">
        <Card.Body>
            <div className={`stat-icon mb-3 text-${color}`}><i className={`bi ${icon}`}></i></div>
            <h3 className="card-title">{value ?? '...'}</h3>
            <p className="card-text text-muted">{title}</p>
        </Card.Body>
    </Card>
);

function Dashboard() {
    const { role } = useContext(UserContext);
    const [stats, setStats] = useState({});
    const [actionableTickets, setActionableTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats and tickets in parallel
                const [statsRes, ticketsRes] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getActionableTickets()
                ]);
                setStats(statsRes.data);
                setActionableTickets(ticketsRes.data);
            } catch (err) {
                toast.error(err.response?.data?.message || "Could not load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const chartData = stats.ticketsByStatus ?
        Object.entries(stats.ticketsByStatus).map(([name, value]) => ({ name, tickets: value })) : [];

    const getWidgetTitle = () => {
        if (role === 'ROLE_CUSTOMER') return 'My Recently Updated Tickets';
        if (role === 'ROLE_SUPPORT_AGENT') return 'My Active Tickets';
        if (role === 'ROLE_SUPERVISOR' || role === 'ROLE_ADMIN') return 'New & Unassigned Tickets';
        return 'Tickets';
    };

    if (isLoading) {
        return <Container className="text-center p-5"><Spinner animation="border" /></Container>;
    }

    return (
        <Container fluid className="p-4">
            <div className="d-flex flex-column align-items-center flex-md-row justify-content-md-between mb-4">
                <h1 className="mb-3 mb-md-0">Dashboard</h1>

                {role === 'ROLE_CUSTOMER' && (
                    <div className="d-flex gap-2">
                        <LinkContainer to="/tickets">
                            <Button variant="outline-primary">View All My Tickets</Button>
                        </LinkContainer>
                        <LinkContainer to="/tickets/new">
                            <Button variant="primary">
                                <i className="bi bi-plus-circle me-2"></i>Create New Ticket
                            </Button>
                        </LinkContainer>
                    </div>
                )}

                {role === 'ROLE_SUPPORT_AGENT' && (
                    <div className="d-flex gap-2">
                        <LinkContainer to="/tickets">
                            <Button variant="outline-primary">View My Tickets</Button>
                        </LinkContainer>
                        <LinkContainer to="/tickets/new">
                            <Button variant="primary">
                                <i className="bi bi-plus-circle me-2"></i>Create Ticket On Behalf Of
                            </Button>
                        </LinkContainer>
                    </div>
                )}
            </div>

            {role === 'ROLE_CUSTOMER' && (
                <Row>
                    <Col md={6}><StatCard title="My Open Tickets" value={stats.openTickets} icon="bi-envelope-open" color="primary" /></Col>
                    <Col md={6}><StatCard title="My Resolved Tickets" value={stats.resolvedTickets} icon="bi-check2-circle" color="success" /></Col>
                </Row>
            )}

            {role === 'ROLE_SUPPORT_AGENT' && (
                <Row>
                    <Col md={6}><StatCard title="Tickets Assigned To Me" value={stats.ticketsAssignedToMe} icon="bi-person-check" color="primary" /></Col>
                    <Col md={6}><StatCard title="Unassigned Tickets in Queue" value={stats.unassignedTickets} icon="bi-inbox" color="warning" /></Col>
                </Row>
            )}

            {(role === 'ROLE_SUPERVISOR' || role === 'ROLE_ADMIN') && (
                <>
                    <Row>
                        <Col md={4}><StatCard title="Total Open Tickets" value={stats.openTickets} icon="bi-envelope-open" color="primary" /></Col>
                        <Col md={4}><StatCard title="Unassigned Tickets" value={stats.unassignedTickets} icon="bi-inbox" color="warning" /></Col>
                        <Col md={4}><StatCard title="Tickets Closed Today" value={stats.ticketsClosedToday} icon="bi-calendar-check" color="success" /></Col>
                    </Row>

                    <Card className="mt-4">
                        <Card.Body>
                            <Card.Title>Tickets by Status</Card.Title>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="tickets" fill="#1F7A8C" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </>
            )}

            <ActionableTicketsWidget
                title={getWidgetTitle()}
                tickets={actionableTickets}
                role={role}
            />

        </Container>
    );
}

export default Dashboard;