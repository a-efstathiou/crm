import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationModal = ({ show, onHide, onConfirm, userName }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* The confirmation message is dynamic, making it clear who is being deleted */}
                <p>Are you sure you want to permanently delete the user: <strong>{userName}</strong>?</p>
                <p className="text-danger">This action cannot be undone.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                {/* A red "danger" button is standard UX for a destructive action */}
                <Button variant="danger" onClick={onConfirm}>
                    Yes, Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;