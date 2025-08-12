import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatRoleForDisplay} from '../../utils/roleUtils.js'; // Adjust the path as needed

const EditUserModal = ({ show, onHide, user, availableRoles, onSave }) => {
    // The modal manages its own internal state for the selected role
    const [selectedRole, setSelectedRole] = useState('');

    // When the user prop changes (i.e., when the modal is opened for a new user),
    // update the internal state to match that user's current role.
    useEffect(() => {
        if (user && user.authorities) {
            const displayRole = formatRoleForDisplay(user.authorities[0]);
            setSelectedRole(displayRole);
        }
    }, [user]);

    const handleSave = () => {
        // When saving, pass the user's ID and the newly selected role back to the parent
        onSave(user.id, selectedRole);
    };

    if (!user) {
        return null; // Don't render anything if there's no user data
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Role for {user.firstName} {user.lastName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p><strong>Email:</strong> {user.email}</p>
                <Form.Group>
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