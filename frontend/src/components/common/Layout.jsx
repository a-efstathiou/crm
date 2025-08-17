import React, {useContext} from 'react';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';
import '../../style/Layout.css';
import {UserContext} from "./UserContext.jsx";

function Layout({ children, collapsed, setCollapsed, showSidebar }) {
    const { isLoggedIn } = useContext(UserContext);

    return (
        <div className={`layout-container d-flex ${collapsed ? 'collapsed' : ''}`}>
            <TopNav/>
            <div className="d-flex flex-grow-1 min-h-0" style={{ marginTop: '56px' , minHeight: 0  }}>
                {showSidebar && isLoggedIn && (
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
