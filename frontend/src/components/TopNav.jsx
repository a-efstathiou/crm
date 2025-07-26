import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import '../style/TopNav.css';

function TopNav() {
    return (
        <Navbar className="top-nav shadow-sm px-3" fixed="top">
            <Container fluid>
                <Navbar.Brand className="fw-bold brand-text" href="#">NexusFlow</Navbar.Brand>
                <Nav className="ms-auto align-items-center topnav-links">
                    <Nav.Link href="#">Help</Nav.Link>
                    <Nav.Link href="#">Settings</Nav.Link>
                    <Nav.Link href="#">User</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default TopNav;
