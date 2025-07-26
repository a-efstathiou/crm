import React, {useContext, useEffect} from 'react';
import {Nav} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { UserContext } from './UserContext.jsx';
import '../style/Sidebar.css';

function Sidebar({collapsed, setCollapsed}) {
    const { isLoggedIn, isAdmin } = useContext(UserContext);

    const toggleSidebar = () => setCollapsed(!collapsed);

    useEffect(() => {

        if (window.innerWidth < 768) {
            setCollapsed(true);
        }
    }, [setCollapsed]);
    
    return (
        <div className={`sidebar d-flex flex-column flex-shrink-0 p-3 ${collapsed ? 'collapsed' : ''}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>

            <div className="p-3">
                <h4 className="logo-text">NexusFlow</h4>
                <p className="text-muted small hide-on-collapse">Dashboard</p>
            </div>

            <Nav className="sidebar-nav">
                <LinkContainer to="/">
                    <Nav.Link className="sidebar-link">
                        <i className="bi bi-house"></i>
                        <span className="hide-on-collapse">Dashboard</span>
                    </Nav.Link>
                </LinkContainer>
                {isLoggedIn && isAdmin && (
                    <>
                        <LinkContainer to="/admin/users">
                            <Nav.Link className="sidebar-link">
                                <i className="bi bi-people"></i>
                                <span className="hide-on-collapse">Users</span>
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/requests">
                            <Nav.Link className="sidebar-link">
                                <i className="bi bi-box"></i>
                                <span className="hide-on-collapse">Support</span>
                            </Nav.Link>
                        </LinkContainer>
                    </>
                )}
                <div>
                    {isLoggedIn ? (
                        <LinkContainer to="/profile">
                            <Nav.Link className="sidebar-link">
                                <i className="bi bi-person-circle"></i>
                                <span className="hide-on-collapse">My Profile</span>
                            </Nav.Link>
                        </LinkContainer>
                    ) : (
                        <LinkContainer to="/login">
                            <Nav.Link className="sidebar-link">
                                <i className="bi bi-box-arrow-in-right"></i>
                                <span className="hide-on-collapse">Login</span>
                            </Nav.Link>
                        </LinkContainer>
                    )}
                </div>
            </Nav>
        </div>
    );
}

export default Sidebar;
