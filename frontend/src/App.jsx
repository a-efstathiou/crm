import {useEffect, useRef, useState} from 'react'
import './App.css'
import refreshPageService from "./services/refreshPageService.js";
import {UserContext} from "./components/UserContext.jsx";
import {ToastContainer} from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import PageNotFound from "./components/PageNotFound.jsx";
import Profile from "./components/profile/Profile.jsx";
import UserList from "./components/admin/UserList.jsx";
import SupportTickets from "./components/tickets/SupportTickets.jsx";
import Layout from "./components/Layout.jsx";

function App() {

    const [firstName,setFirstName]=useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState("");
    const [role,setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(true);
    const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);

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
                // Handle any errors during fetching
                console.error("Error fetching localUser:", error);
            })
                .finally(() => {
                    // This is guaranteed to run after the promise settles (either then or catch)
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false); // If not refreshing, we are not loading
        }
        refreshPageService.setReload(true);

    }, []); // <-- The empty array means this effect runs only once on mount

    // useEffect(() => {
    //     if(user !== ""){
    //         refreshPageService.onPageRefresh(isLoggedIn,user.id);
    //     }
    // },[isLoggedIn,user])

    useEffect(() => {
        const handleResize = () => {
            setShowSidebar(window.innerWidth >= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                        setFirstName
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
                            <Route path="/profile" element={<Profile />} />
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
