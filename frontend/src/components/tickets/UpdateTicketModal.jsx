import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import categoryService from '../../services/categoryService';

function UpdateTicketModal({ show, onHide, onSave, ticket }) {
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (ticket) {
            setStatus(ticket.status);
            setPriority(ticket.priority);
            setCategoryId(ticket.category.id);
        }
        categoryService.getActiveCategories().then(res => setCategories(res.data));
    }, [ticket]);

    const handleSave = () => {
        setIsSaving(true);
        const updateData = { status, priority, categoryId };

        try {
            onSave(updateData);
            onHide();
        } finally {
            setIsSaving(false);
        }

    };

    if (!ticket) return null;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton><Modal.Title>Update Ticket Properties</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                            <option>NEW</option><option>OPEN</option><option>IN_PROGRESS</option>
                            <option>WAITING_CUSTOMER</option><option>ON_HOLD</option><option>RESOLVED</option><option>CLOSED</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select value={priority} onChange={e => setPriority(e.target.value)}>
                            <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateTicketModal;