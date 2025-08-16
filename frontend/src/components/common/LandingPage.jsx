import React, {useContext} from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../../style/LandingPage.css';
import {UserContext} from "./UserContext.jsx";

function LandingPage() {

    const { appName } = useContext(UserContext);

    return (
        <div className="landing-page">
            <header className="hero-section text-center text-white">
                <Container>
                    <h1 className="hero-title display-4">Effortless Support, Seamless Flow.</h1>
                    <p className="hero-subtitle lead">
                        {appName} is the powerful, intuitive solution for managing customer support tickets
                        with clarity and efficiency.
                    </p>
                    <LinkContainer to="/login">
                        <Button variant="primary" size="lg" className="hero-button">Get Started</Button>
                    </LinkContainer>
                </Container>
            </header>

            <section className="features-section text-center">
                <Container>
                    <Row>
                        <Col md={4} className="feature-item mb-5 mb-md-0">
                            <div className="feature-icon mb-3">
                                <i className="bi bi-ticket-detailed"></i>
                            </div>
                            <h3>Centralized Ticketing</h3>
                            <p className="text-muted">
                                Manage all customer support requests from a single, intuitive dashboard. Never lose track of a conversation again.
                            </p>
                        </Col>
                        <Col md={4} className="feature-item mb-5 mb-md-0">
                            <div className="feature-icon mb-3">
                                <i className="bi bi-people"></i>
                            </div>
                            <h3>Role-Based Access</h3>
                            <p className="text-muted">
                                Powerful control for Admins, Supervisors, Agents, and Customers ensures everyone sees exactly what they need to.
                            </p>
                        </Col>
                        <Col md={4} className="feature-item">
                            <div className="feature-icon mb-3">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <h3>Audited & Secure</h3>
                            <p className="text-muted">
                                A complete, immutable history for every ticket provides clarity, accountability, and valuable insights into your workflow.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </section>

            <footer className="footer text-center">
                <Container>
                    <p className="text-muted">&copy; {new Date().getFullYear()} TicketFlow. All Rights Reserved.</p>
                </Container>
            </footer>
        </div>
    );
}

export default LandingPage;