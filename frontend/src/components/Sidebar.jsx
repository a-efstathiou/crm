import React, { useContext} from 'react';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { UserContext } from './UserContext.jsx';
import '../style/Sidebar.css';
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Offcanvas from 'react-bootstrap/Offcanvas';
import { RxHamburgerMenu } from "react-icons/rx";

function Sidebar({collapsed, setCollapsed}) {
    const { isLoggedIn, isAdmin } = useContext(UserContext);

    const toggleSidebar = () => setCollapsed(!collapsed);

    return (
        <div className={`sidebar d-flex flex-column flex-shrink-0 p-3 ${collapsed ? 'collapsed' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>

            <div className="p-3">
                <h4 className="logo-text">NexusFlow</h4>
                <p className="text-muted small hide-on-collapse">Dashboard</p>
            </div>

            <Nav className="flex-column mt-3">
                <LinkContainer to="/">
                    <Nav.Link className="sidebar-link"><i className="bi bi-house me-2"></i><span className="hide-on-collapse">Dashboard</span></Nav.Link>
                </LinkContainer>
                {isLoggedIn && isAdmin && (
                    <>
                        <LinkContainer to="/admin/users">
                            <Nav.Link className="sidebar-link"><i className="bi bi-people me-2"></i><span className="hide-on-collapse">Users</span></Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/requests">
                            <Nav.Link className="sidebar-link"><i className="bi bi-box me-2"></i><span className="hide-on-collapse">Support</span></Nav.Link>
                        </LinkContainer>
                    </>
                )}
                <div className="profile-section mt-auto pt-3">
                    {isLoggedIn ? (
                        <LinkContainer to="/profile">
                            <Nav.Link className="sidebar-link"><i className="bi bi-person-circle me-2"></i><span className="hide-on-collapse">My Profile</span></Nav.Link>
                        </LinkContainer>
                    ) : (
                        <LinkContainer to="/login">
                            <Nav.Link className="sidebar-link"><i className="bi bi-box-arrow-in-right me-2"></i><span className="hide-on-collapse">Login</span></Nav.Link>
                        </LinkContainer>
                    )}
                </div>
            </Nav>
        </div>
    );
}

export default Sidebar;
