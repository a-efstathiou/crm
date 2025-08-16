import {useEffect, useRef, useState} from 'react'
import './App.css'
import refreshPageService from "./services/refreshPageService.js";
import {UserContext} from "./components/common/UserContext.jsx";
import {ToastContainer} from "react-toastify";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./components/common/Login.jsx";
import Home from "./components/common/Home.jsx";
import PageNotFound from "./components/common/PageNotFound.jsx";
import Profile from "./components/profile/Profile.jsx";
import UserList from "./components/admin/UserList.jsx";
import SupportTickets from "./components/tickets/SupportTickets.jsx";
import Layout from "./components/common/Layout.jsx";
import SettingsPage from "./components/settings/SettingsPage.jsx";
import settingsService from "./services/settingsService.js";
import CategoryList from "./components/admin/CategoryList.jsx";
import HelpPage from "./components/common/HelpPage.jsx";

function App() {

    const [firstName,setFirstName]=useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState("");
    const [role,setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(true);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
    const [appName, setAppName] = useState('TicketFlow'); // Default name

    const hasRun = useRef(false);

    useEffect(() => {
        if(hasRun.current)return;
        if (refreshPageService.getReload() === 'true') {
            hasRun.current = true;
            refreshPageService.onPageLoad()
                .then((localUser) => {
                    if (localUser != null) {
                        // Use the fetched 'localUser' directly to update all related state
                        setUser(localUser);
                        setIsLoggedIn(refreshPageService.getIsLoggedIn());
                        setFirstName(localUser.firstName);
                        setRole(localUser.authorities?.[0] || null); // Safely access authorities
                        console.log(localUser);
                    }
                }).catch((error) => {
                console.error("Error fetching localUser:", error);
            })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
        refreshPageService.setReload(true);

    }, []);

    useEffect(() => {
        if(user && user.id){
            refreshPageService.onPageRefresh(isLoggedIn,user.id);
        }
    },[isLoggedIn,user])

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await settingsService.getApplicationSettings();
                if (settings.appName) {
                    setAppName(settings.appName);
                }
            } catch (error) {
                console.error("Could not fetch application settings:", error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <div className="App">
            <BrowserRouter>
                <UserContext.Provider
                    value={{
                        isLoggedIn,
                        setIsLoggedIn,
                        user,
                        setUser,
                        role,
                        setRole,
                        firstName,
                        setFirstName,
                        appName,
                        setAppName,
                        isLoading
                    }}
                >
                    <Layout
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                        showSidebar={showSidebar}
                        setShowSidebar={setShowSidebar}
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/help" element={<HelpPage />} />
                            <Route path="*" element={<PageNotFound />} />

                            <Route
                                path="/admin/users"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        requiredRoles={["ROLE_ADMIN"]}
                                        isLoggedIn={isLoggedIn}
                                    >
                                        <UserList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/categories"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        requiredRoles={["ROLE_ADMIN"]}
                                        isLoggedIn={isLoggedIn}
                                    >
                                        <CategoryList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/tickets"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        requiredRoles={["ROLE_ADMIN", "ROLE_SUPPORT_AGENT", "ROLE_SUPERVISOR"]}
                                        isLoggedIn={isLoggedIn}
                                    >
                                        <SupportTickets />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        requiredRoles={[]}
                                        isLoggedIn={isLoggedIn}
                                    >
                                        <SettingsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        requiredRoles={[]}
                                        isLoggedIn={isLoggedIn}
                                    >
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />



                        </Routes>
                    </Layout>

                    <ToastContainer
                        position="bottom-right"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="dark"
                    />
                </UserContext.Provider>
            </BrowserRouter>
        </div>
    );
}

export default App
