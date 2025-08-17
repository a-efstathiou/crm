import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

function ActionableTicketsWidget({ title, tickets, role }) {
    if (!tickets || tickets.length === 0) {
        return (
            <Card className="mt-4">
                <Card.Body className="text-center text-muted">
                    <Card.Title>{title}</Card.Title>
                    <p>No tickets to display.</p>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mt-4">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Table striped hover responsive size="sm">
                    <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Status</th>
                        {role !== 'ROLE_CUSTOMER' && <th>Requester</th>}
                        <th>Last Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td>
                                <LinkContainer to={`/tickets/${ticket.id}`}>
                                    <a href={`/tickets/${ticket.id}`}>{ticket.subject}</a>
                                </LinkContainer>
                            </td>
                            <td><span className="badge bg-primary">{ticket.status}</span></td>
                            {role !== 'ROLE_CUSTOMER' && <td>{ticket.requester.fullName}</td>}
                            <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
}

export default ActionableTicketsWidget;