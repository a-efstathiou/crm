import React, {useContext} from 'react';
import '../../style/Home.css';
import Dashboard from "./Dashboard.jsx";
import {UserContext} from "./UserContext.jsx";
import LandingPage from "./LandingPage.jsx";
import {Spinner} from "react-bootstrap";

const Home = () => {
    const { isLoggedIn, isLoading } = useContext(UserContext);

    console.log("isLoading: ",isLoading);
    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return isLoggedIn ? <Dashboard /> : <LandingPage />;

};

export default Home;