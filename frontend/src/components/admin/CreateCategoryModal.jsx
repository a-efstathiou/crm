import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function CreateCategoryModal({ show, onHide, onSave }) {

    const [categoryName, setCategoryName] = useState('');

    const handleSave = () => {
        if (categoryName.trim()) {
            onSave(categoryName.trim());
            setCategoryName(''); // Clear field after save
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formCategoryName">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="e.g., Technical Support"
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Create</Button>
            </Modal.Footer>
        </Modal>
    );

}

export default CreateCategoryModal;