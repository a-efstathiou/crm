import React, {useContext, useState} from 'react';
import {Collapse, Nav} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { UserContext } from './UserContext.jsx';
import {checkIfHasRole} from "../../utils/roleUtils.js";
import '../../style/Sidebar.css';

function Sidebar({collapsed, setCollapsed}) {
    const { isLoggedIn, role,appName } = useContext(UserContext);
    const [isAdminOpen, setAdminOpen] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
        if (!collapsed) {
            setAdminOpen(false);
        }
    }

    return (
        <div className={`sidebar d-flex flex-column flex-shrink-0 p-3 ${collapsed ? 'collapsed' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                <i className={`bi bi-chevron-left toggle-arrow ${collapsed ? 'rotated' : ''}`}></i>
            </button>

            <div className="p-3">
                <h4 className="logo-text">{appName}</h4>
                <p className="small hide-on-collapse">Ticket Management System</p>
            </div>

            <Nav className="sidebar-nav navbar-nav-scroll">
                <LinkContainer to="/">
                    <Nav.Link className="sidebar-link">
                        <i className="bi bi-house"></i>
                        <span className="hide-on-collapse">Dashboard</span>
                    </Nav.Link>
                </LinkContainer>
                {isLoggedIn && checkIfHasRole(role, "ROLE_ADMIN") && (
                    <>
                        <Nav.Link
                            onClick={() => !collapsed && setAdminOpen(!isAdminOpen)}
                            aria-controls="admin-collapse-text"
                            aria-expanded={isAdminOpen}
                            className="sidebar-link"
                            disabled={collapsed}
                        >
                            <i className="bi bi-person-rolodex"></i>
                            <span className="hide-on-collapse">Admin Panel</span>
                            {!collapsed && <i className={`bi bi-chevron-down ms-auto arrow-icon ${isAdminOpen ? 'rotate-180' : ''}`}></i>}
                        </Nav.Link>

                        {/* Collapsible Admin Links */}
                        <Collapse in={!collapsed && isAdminOpen}>
                            <div id="admin-collapse-text">
                                <LinkContainer to="/admin/users">
                                    <Nav.Link className="sidebar-link admin-sub-link">
                                        <i className="bi bi-people"></i>
                                        <span className="hide-on-collapse">Users</span>
                                    </Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/admin/categories">
                                    <Nav.Link className="sidebar-link admin-sub-link">
                                        <i className="bi bi-tags"></i>
                                        <span className="hide-on-collapse">Categories</span>
                                    </Nav.Link>
                                </LinkContainer>
                                <LinkContainer to="/admin/tickets">
                                    <Nav.Link className="sidebar-link admin-sub-link">
                                        <i className="bi bi-box"></i>
                                        <span className="hide-on-collapse">Support Tickets</span>
                                    </Nav.Link>
                                </LinkContainer>
                            </div>
                        </Collapse>
                    </>
                )}
            </Nav>
        </div>
    );
}

export default Sidebar;
