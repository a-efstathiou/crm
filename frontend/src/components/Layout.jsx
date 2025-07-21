// components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import '../style/Layout.css';

function Layout({ children, collapsed, setCollapsed }) {
    return (
        <div className={`layout-container d-flex flex-grow-1 ${collapsed ? 'collapsed' : ''}`}>
            <TopNav />
            <div className="d-flex" style={{ marginTop: '56px' , minHeight: 0  }}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <main className="main-content">{children}</main>
            </div>
        </div>
    );
}

export default Layout;
