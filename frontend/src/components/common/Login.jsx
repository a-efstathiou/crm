import React, { useState, useContext } from 'react';
import LoadingButton from './LoadingButton.jsx';
import Card from 'react-bootstrap/Card';
import {FaEyeSlash, FaEye} from 'react-icons/fa';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import AuthService from "../../services/authService.js";
import UserService from "../../services/userService.js";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import '../../style/Login.css';
import {UserContext} from "./UserContext.jsx";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const {setIsLoggedIn} = useContext(UserContext);
    const {setRole, setUser} = useContext(UserContext);

    const navigate = useNavigate();

    const handleButtonClick = async () => {
        try {
            await AuthService.login(email, password);
            await handleLogin();
            setIsLoggedIn(true);
            toast.success("Successful Login");
        } catch (error) {
            setIsLoggedIn(false);
            if (!error.response) {
                toast.error("No response from the server. Please try again later.");
                return;
            }
            if (error.response.status === 401) {
                toast.error("Invalid Credentials");
            }
            else {
                toast.error("An error occurred. Please try again later.");
            }
        }

    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        }
    };

    const handleLogin = async () => {
        try {
            const response = await UserService.getUserByEmail(email);
            await setUser(response);
            await setRole(response?.authorities[0] || null);
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    }


    return(
        <Container fluid className="login-page">
            <Card className="login-card">
                <Card.Body className="card-body">
                    <div className="text-center mb-4">
                        <h1 className="login_title">Welcome Back</h1>
                        <p className="login_subtitle">Sign in to your account</p>
                    </div>

                    <Form onSubmit={(e) => { e.preventDefault(); handleButtonClick(); }}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                className="custom-fields-2"
                                placeholder="Enter email"
                                value={email}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="custom-fields-2"
                                    name="password"
                                    value={password}
                                    onChange={handleInputChange}
                                />
                                <Button
                                    variant="outline-secondary"
                                    className="custom-eye-Btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        <LoadingButton
                            name="Log in"
                            loadingText="Logging in..."
                            onClick={handleButtonClick}
                            className="custom-btn-2"
                        />
                    </Form>

                    <div className="text-center mt-4">
                        <p className="login_subtitle">
                            <i className="bi bi-shield-lock-fill me-1"></i>
                            Access is managed by your organization. <strong>Contact your admin</strong> if you need an account.
                        </p>
                    </div>
                </Card.Body>
            </Card>
        </Container>

    )

}

export default Login;