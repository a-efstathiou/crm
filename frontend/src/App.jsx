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
import SupportRequests from "./components/requests/SupportRequests.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Layout from "./components/Layout.jsx";

function App() {

    const [firstName,setFirstName]=useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState("");
    const [isAdmin,setIsAdmin] = useState(false);
    const [isInspector,setIsInspector] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(true);

    const hasRun = useRef(false);

    useEffect(() => {
        setIsLoading(true);
        if(!hasRun.current){
            if(refreshPageService.getReload() === 'true'){
                hasRun.current = true;

                refreshPageService.onPageLoad()
                    .then((localUser) => {
                        if (localUser != null) {
                            setUser(localUser);
                            setIsLoggedIn(refreshPageService.getIsLoggedIn());
                            setFirstName(localUser.firstName);
                        }
                    }).catch((error) => {
                    // Handle any errors during fetching
                    console.error("Error fetching localUser:", error);
                })
                    .finally(() => {
                        console.log("user: ",user);
                        setIsLoading(false);
                    });

            }
            refreshPageService.setReload(true);

        }

    }, [user]);

    useEffect(() => {
        if(user !== ""){
            refreshPageService.onPageRefresh(isLoggedIn,user.id);
        }
    },[isLoggedIn,user])

    return (
        <div className="App">
            <BrowserRouter>
                <UserContext.Provider
                    value={{
                        isLoggedIn,
                        setIsLoggedIn,
                        user,
                        setUser,
                        isAdmin,
                        setIsAdmin,
                        isInspector,
                        setIsInspector,
                        firstName,
                        setFirstName
                    }}
                >
                    <Layout collapsed={collapsed} setCollapsed={setCollapsed}>
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
                                        isAuthenticated={isLoggedIn}
                                        hasPermission={isAdmin}
                                    >
                                        <UserList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin/requests"
                                element={
                                    <ProtectedRoute
                                        isLoading={isLoading}
                                        isAuthenticated={isLoggedIn}
                                        hasPermission={isAdmin}
                                    >
                                        <SupportRequests />
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
