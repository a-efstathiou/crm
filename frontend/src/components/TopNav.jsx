import React, {useContext, useState} from 'react';
import {Navbar, Container, Nav, Offcanvas} from 'react-bootstrap';
import '../style/TopNav.css';
import {UserContext} from "./UserContext.jsx";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";

function TopNav() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const { isLoggedIn, isAdmin } = useContext(UserContext);

    return (
        <>
            <Navbar className="top-nav px-3" fixed="top">
                <Container fluid>
                    <Button variant="outline-light" className="d-md-none me-2" onClick={handleShow}>
                        <i className="bi bi-list"></i>
                    </Button>
                    <Navbar.Brand className="fw-bold brand-text" href="#">NexusFlow</Navbar.Brand>
                    <Nav className="ms-auto d-none d-md-flex topnav-links">
                        <Nav.Link href="#">Help</Nav.Link>
                        <Nav.Link href="#">Settings</Nav.Link>
                        <Nav.Link href="#">User</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>

            {show &&
            <Offcanvas
                show={show}
                onHide={handleClose}
                responsive="md"
                className="sidebar-offcanvas"
                backdrop="true"
                scroll="true"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>NexusFlow</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        <LinkContainer to="/" onClick={handleClose}>
                            <Nav.Link><i className="bi bi-house me-2"></i> Dashboard</Nav.Link>
                        </LinkContainer>
                        {isLoggedIn && isAdmin && (
                            <>
                                <LinkContainer to="/admin/users" onClick={handleClose}>
                                    <Nav.Link><i className="bi bi-people me-2"></i> Users</Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/admin/requests" onClick={handleClose}>
                                    <Nav.Link><i className="bi bi-box me-2"></i> Support</Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                        {isLoggedIn ? (
                            <LinkContainer to="/profile" onClick={handleClose}>
                                <Nav.Link><i className="bi bi-person-circle me-2"></i> My Profile</Nav.Link>
                            </LinkContainer>
                        ) : (
                            <LinkContainer to="/login" onClick={handleClose}>
                                <Nav.Link><i className="bi bi-box-arrow-in-right me-2"></i> Login</Nav.Link>
                            </LinkContainer>
                        )}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
            }
        </>
    );
}

export default TopNav;
