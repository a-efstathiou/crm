import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { formatRoleForDisplay } from '../../utils/roleUtils.js';

const EditUserModal = ({ show, onHide, user, availableRoles, onSave }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            if (user.authorities) {
                const displayRole = formatRoleForDisplay(user.authorities[0]);
                setSelectedRole(displayRole);
            }
        }
    }, [user]);

    const handleSave = () => {
        const updatedUserData = {
            id: user.id,
            firstName,
            lastName,
            role: selectedRole,
        };
        onSave(updatedUserData);
    };

    if (!user) {
        return null;
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit User: {firstName} {lastName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Email:</strong> {user.email}</p>
                <Form>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3" controlId="formFirstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3" controlId="formLastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="formUserRole">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            {availableRoles.map(apiRole => {
                                const displayRole = formatRoleForDisplay(apiRole);
                                return (
                                    <option key={apiRole} value={displayRole}>
                                        {displayRole}
                                    </option>
                                );
                            })}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditUserModal;