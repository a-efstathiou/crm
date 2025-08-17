// src/components/help/HelpPage.jsx

import React, { useContext } from 'react';
import { Container, Accordion } from 'react-bootstrap';
import { UserContext } from './UserContext';
import { checkIfHasRole } from '../../utils/roleUtils';
import '../../style/HelpPage.css';

function HelpPage() {
    const { role } = useContext(UserContext);

    return (
        <Container fluid className="p-4 help-page-container">
            <div className="text-center mb-5">
                <h1>Help & FAQ</h1>
                <p className="lead text-muted">Find answers to common questions about using TicketFlow.</p>
            </div>

            <Accordion defaultActiveKey="0" alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>General</Accordion.Header>
                    <Accordion.Body>
                        <strong>What is TicketFlow?</strong>
                        <p>TicketFlow is a streamlined system for managing support tickets, designed to improve
                            communication and efficiency between customers and support staff.</p>

                        <strong>How do I change my password?</strong>
                        <p>You can change your password at any time by navigating to the "Settings" page, which is
                            accessible from the user dropdown menu in the top-right corner of the application.</p>
                    </Accordion.Body>
                </Accordion.Item>

                {(!role || checkIfHasRole(role, "ROLE_CUSTOMER")) && (
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>For Customers</Accordion.Header>
                        <Accordion.Body>
                            <strong>How do I create a new support ticket?</strong>
                            <p>Once logged in, you can create a new ticket by clicking the prominent
                                "Create New Ticket" button on your Dashboard. Please provide a clear subject and a
                                detailed description of your issue to help us resolve it as quickly as possible.</p>

                            <strong>How can I check the status of my ticket?</strong>
                            <p>You can view all your tickets and their current status by clicking the "View All My Tickets"
                                button on your dashboard, which will take you to the main ticket list page.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                )}

                {checkIfHasRole(role, ["ROLE_SUPPORT_AGENT", "ROLE_SUPERVISOR"]) && (
                    <Accordion.Item eventKey="2">
                        <Accordion.Header>For Agents & Supervisors</Accordion.Header>
                        <Accordion.Body>
                            <strong>How do I claim an unassigned ticket?</strong>
                            <p>From the main ticket list, filter for "Unassigned" tickets. When you open a ticket's
                                detail view, a green "Claim" button will appear in the action bar at the top. Clicking
                                this will instantly assign the ticket to you and move its status to Open.</p>
                            <strong>What is an "Internal Note"?</strong>
                            <p>An internal note is a comment on a ticket that is only visible to other internal staff
                                (Agents, Supervisors, and Admins). It is never visible to the customer and is useful
                                for internal collaboration.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                )}

                {checkIfHasRole(role, "ROLE_ADMIN") && (
                    <Accordion.Item eventKey="3">
                        <Accordion.Header>For Administrators</Accordion.Header>
                        <Accordion.Body>
                            <strong>How do I manage user roles?</strong>
                            <p>Navigate to the "Users" section in the Admin Panel. From there, you can edit any user to
                                change their assigned role. Remember that changing a role grants or revokes significant
                                permissions.</p>

                            <strong>What does "disabling" a category do?</strong>
                            <p>Disabling a category is a "soft delete." The category will no longer appear in dropdowns
                                for new tickets, but it will remain in the database to preserve the historical integrity
                                of old tickets that were assigned to it. It can be re-enabled at any time.</p>
                        </Accordion.Body>
                    </Accordion.Item>
                )}
            </Accordion>
        </Container>
    );
}

export default HelpPage;