// components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import '../style/Layout.css';
import {LinkContainer} from "react-router-bootstrap";
import {Nav} from "react-bootstrap";

function Layout({ children, collapsed, setCollapsed, showSidebar }) {
    return (
        <div className={`layout-container d-flex ${collapsed ? 'collapsed' : ''}`}>
            <TopNav/>
            <div className="d-flex flex-grow-1 min-h-0" style={{ marginTop: '56px' , minHeight: 0  }}>
                {showSidebar && (
                    <>
                        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                    </>
                )}
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}

export default Layout;
