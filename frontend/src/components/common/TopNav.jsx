import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Navbar, Container, Nav, Offcanvas, Collapse, Dropdown} from 'react-bootstrap';
import '../../style/TopNav.css';
import {UserContext} from "./UserContext.jsx";
import {LinkContainer} from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import {checkIfHasRole} from "../../utils/roleUtils.js";
import authService from "../../services/authService.js";
import {useNavigate} from "react-router-dom";
import LogoImage from "./LogoImage.jsx"

function TopNav() {
    const [show, setShow] = useState(false);
    const [isAdminOpen, setAdminOpen] = useState(false);
    const [isUserOpen, setUserOpen] = useState(false);
    const { isLoggedIn, user, role, setIsLoggedIn, setUser, appName } = useContext(UserContext);
    const navigate = useNavigate();

    const logoUrl = "http://localhost:8080/api/v1/settings/logo";

    const handleClose = useCallback(() => {
        setShow(false);
        setAdminOpen(false);
        setUserOpen(false);
    }, []);

    const handleShow = useCallback(() => {
        setShow(true);
    }, []);

    const handleLogout = useCallback(() => {
        authService.logout();
        setIsLoggedIn(false);
        setUser(null);
        console.log("User logged out");
        navigate('/');
    }, [navigate, setIsLoggedIn, setUser]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                if (show) {
                    handleClose();
                }
            }
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [show, handleClose]);

    const isInternalUser = checkIfHasRole(role, ["ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_SUPPORT_AGENT"]);
    const isAdmin = checkIfHasRole(role, "ROLE_ADMIN");

    return (
        <>
            <Navbar className="top-nav px-3" fixed="top">
                <Container fluid>
                    <Button variant="outline-light" className="d-md-none me-2" onClick={handleShow}>
                        <i className="bi bi-list"></i>
                    </Button>
                    <LinkContainer to="/">
                        <Navbar.Brand className="fw-bold brand-text d-flex align-items-center" href="#">
                            <LogoImage
                                src={logoUrl}
                                alt={`${appName} logo`}
                                height="30"
                                className="d-inline-block align-top me-2"
                            />
                            {appName}
                        </Navbar.Brand>
                    </LinkContainer>
                    <Nav className="ms-auto d-none d-md-flex topnav-links align-items-center">
                        <Nav.Link href="/help">Help</Nav.Link>

                        {isLoggedIn ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle
                                    variant="link"
                                    id="topnav-dropdown"
                                    className="nav-link"
                                >
                                    <i className="bi bi-person-circle me-2"></i>
                                    {user?.firstName || 'User'}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <LinkContainer to="/settings">
                                        <Dropdown.Item>Settings</Dropdown.Item>
                                    </LinkContainer>
                                    <Dropdown.Divider />
                                    <Dropdown.Item onClick={handleLogout}>
                                        Logout
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <LinkContainer to="/login">
                                <Nav.Link>Login</Nav.Link>
                            </LinkContainer>
                        )}
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
                    <Offcanvas.Title>{appName}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column p-0">
                    <Nav className="flex-column offcanvas-nav p-3">
                        {isLoggedIn && (
                            <>
                                <LinkContainer to="/dashboard" onClick={handleClose}>
                                    <Nav.Link><i className="bi bi-house me-2"></i>Dashboard</Nav.Link>
                                </LinkContainer>
                                {isInternalUser && (
                                    <LinkContainer to="/tickets" onClick={handleClose}>
                                        <Nav.Link><i className="bi bi-ticket-detailed me-2"></i>Tickets</Nav.Link>
                                    </LinkContainer>
                                )}
                            </>
                        )}

                        {isLoggedIn && isAdmin && (
                            <>
                                <Nav.Link
                                    onClick={() => setAdminOpen(!isAdminOpen)}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span><i className="bi bi-person-rolodex me-2"></i> Admin Panel</span>
                                    <i className={`bi bi-chevron-down arrow-icon ${isAdminOpen ? 'rotate-180' : ''}`}></i>
                                </Nav.Link>
                                <Collapse in={isAdminOpen}>
                                    <div>
                                        <LinkContainer to="/admin/users" onClick={handleClose}>
                                            <Nav.Link className="offcanvas-sub-link">
                                                <i className="bi bi-people me-2"></i>
                                                Users
                                            </Nav.Link>
                                        </LinkContainer>
                                        <LinkContainer to="/admin/categories">
                                            <Nav.Link className="offcanvas-sub-link">
                                                <i className="bi bi-tags me-2"></i>
                                                Categories
                                            </Nav.Link>
                                        </LinkContainer>
                                    </div>
                                </Collapse>
                            </>
                        )}
                    </Nav>

                    <Nav className="flex-column offcanvas-nav p-3 mt-auto">

                        <Nav.Link href="#" onClick={handleClose}>
                            <i className="bi bi-question-circle me-2"></i> Help
                        </Nav.Link>

                        <hr className="offcanvas-divider" />

                        {isLoggedIn ? (
                            <>
                                <Nav.Link
                                    onClick={() => setUserOpen(!isUserOpen)}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <span><i className="bi bi-person-circle me-2"></i> {user?.firstName || 'User'}</span>
                                    <i className={`bi bi-chevron-down arrow-icon ${isUserOpen ? 'rotate-180' : ''}`}></i>
                                </Nav.Link>
                                <Collapse in={isUserOpen}>
                                    <div>
                                        <LinkContainer to="/profile" onClick={handleClose}>
                                            <Nav.Link className="offcanvas-sub-link"><i className="bi bi-person me-2"></i> My Profile</Nav.Link>
                                        </LinkContainer>
                                        <Nav.Link
                                            className="offcanvas-sub-link"
                                            onClick={() => {
                                                handleLogout();
                                                handleClose();
                                            }}
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i> Logout
                                        </Nav.Link>
                                    </div>
                                </Collapse>
                            </>
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
