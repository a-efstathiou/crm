// Create a new file:
// src/components/tickets/AssignTicketModal.jsx

import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import userService from '../../services/userService';

function AssignTicketModal({ show, onHide, onSave }) {
    const [selectedAssignee, setSelectedAssignee] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadStaffOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) return callback([]);
        userService.searchInternalStaff(inputValue)
            .then(res => {
                const options = res.data.map(u => ({
                    value: u.id,
                    label: `${u.firstName} ${u.lastName} (${u.email})`
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };

    const handleSave = () => {
        if (!selectedAssignee) {
            alert("Please select a user to assign the ticket to.");
            return;
        }
        setIsSaving(true);
        onSave(selectedAssignee.value);
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Assign Ticket</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>Assign to</Form.Label>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadStaffOptions}
                        value={selectedAssignee}
                        onChange={setSelectedAssignee}
                        placeholder="Type to search for an agent..."
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Assigning..." : "Assign"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AssignTicketModal;