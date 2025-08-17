import React, { useState, useEffect} from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import userService from "../../services/userService.js";
import { toast } from 'react-toastify';
import InputGroup from "react-bootstrap/InputGroup";

function ProfileSettings({ currentUser }) {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCurrentPasswordVisible, setCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFirstName(currentUser.firstName || '');
            setLastName(currentUser.lastName || '');
        }
    }, [currentUser]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match!");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long.");
            return;
        }

        setIsLoading(true);

        try {
            await userService.changePassword(currentPassword, newPassword);
            toast.success('Password changed successfully!');
            // Clear the password fields after successful change
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (error) {
            const errorMessage = error.response.data.errorMessage || "An error occurred. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Row className="mt-4">
            <Col xl={6} className="mb-4">
                <Card className="h-100">
                    <Card.Body>
                        <Card.Title>Profile Details</Card.Title>
                        <Row className="justify-content-center">
                            <Col md={9} lg={8} xl={9} xxl={8}>
                                <Form>
                                    <Row>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3" controlId="formFirstName">
                                                <Form.Label>First Name</Form.Label>
                                                <Form.Control type="text" readOnly disabled value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3" controlId="formLastName">
                                                <Form.Label>Last Name</Form.Label>
                                                <Form.Control type="text" readOnly disabled value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control type="email" placeholder={currentUser?.email} readOnly disabled />
                                    </Form.Group>
                                    <Form.Text className="text-muted">
                                        For security and record-keeping, name changes are handled by an administrator.
                                        <b> To request a change, please contact support.</b>
                                    </Form.Text>
                                </Form>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>

            <Col xl={6} className="mb-4">
                <Card className="h-100">
                    <Card.Body>
                        <Card.Title>Change Password</Card.Title>
                        <Row className="justify-content-center">
                            <Col md={9} lg={8} xl={9} xxl={8}>
                                <Form onSubmit={handlePasswordChange}>
                                    <Form.Group className="mb-3" controlId="formCurrentPassword">
                                        <Form.Label>Current Password</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={isCurrentPasswordVisible ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setCurrentPasswordVisible(!isCurrentPasswordVisible)}
                                                aria-label="Toggle current password visibility"
                                            >
                                                <i className={`bi ${isCurrentPasswordVisible ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formNewPassword">
                                        <Form.Label>New Password</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={isNewPasswordVisible ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setNewPasswordVisible(!isNewPasswordVisible)}
                                                aria-label="Toggle new password visibility"
                                            >
                                                <i className={`bi ${isNewPasswordVisible ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                                        <Form.Label>Confirm New Password</Form.Label>
                                        <InputGroup>
                                            <Form.Control
                                                type={isConfirmPasswordVisible ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                                aria-label="Toggle confirm password visibility"
                                            >
                                                <i className={`bi ${isConfirmPasswordVisible ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                            </Button>
                                        </InputGroup>
                                    </Form.Group>
                                    <Button
                                        variant="secondary"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </Form>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}

export default ProfileSettings;