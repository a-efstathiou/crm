import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteConfirmationModal = (
    {
        show,
        onHide,
        onConfirm,
        itemType = 'item',
        itemName,
        actionText = 'delete',
        isPermanent = true
    }) => {

    const title = `Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`;
    const bodyText = `Are you sure you want to ${actionText} the ${itemType}:`;
    const actionButtonText = `Yes, ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{bodyText} <strong>{itemName}</strong> ?</p>
                {isPermanent && (
                    <p className="text-danger">This action cannot be undone.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    {actionButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteConfirmationModal;