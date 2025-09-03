import React, { useState, useRef } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

function AddAttachmentModal({ show, onHide, onSave }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setSelectedFiles(newFiles);
    };

    const handleSave = () => {
        if (selectedFiles.length === 0) {
            toast.warn("Please select at least one file to upload.");
            return;
        }
        setIsUploading(true);
        onSave(selectedFiles);
    };

    const handleClose = () => {
        setSelectedFiles([]);
        setIsUploading(false);
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Attachments</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formFileMultiple">
                    <Form.Label>Select files to upload</Form.Label>
                    <Form.Control
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </Form.Group>
                {selectedFiles.length > 0 && (
                    <ListGroup className="mt-3">
                        {selectedFiles.map((file, index) => (
                            <ListGroup.Item key={index}>
                                <i className="bi bi-file-earmark me-2"></i>{file.name}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Files"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AddAttachmentModal;