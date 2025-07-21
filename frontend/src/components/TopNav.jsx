import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import '../style/TopNav.css';

function TopNav() {
    return (
        <Navbar bg="dark" variant="dark" className="top-nav px-3" fixed="top">
            <Container fluid>
                <Navbar.Brand href="#">NexusFlow</Navbar.Brand>
                <Nav className="ms-auto">
                    <Nav.Link href="#">Help</Nav.Link>
                    <Nav.Link href="#">Settings</Nav.Link>
                    <Nav.Link href="#">User</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    );
}

export default TopNav;
