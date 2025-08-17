import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Form, Button, Card, Row, Col, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';
import categoryService from '../../services/categoryService';
import userService from '../../services/userService';
import { UserContext } from '../common/UserContext';
import { checkIfHasRole } from '../../utils/roleUtils';
import AsyncSelect from 'react-select/async';


function CreateTicket() {
    const { role } = useContext(UserContext);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [categoryId, setCategoryId] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const isInternalUser = checkIfHasRole(role, ["ROLE_SUPPORT_AGENT", "ROLE_SUPERVISOR", "ROLE_ADMIN"]);

    useEffect(() => {
        categoryService.getActiveCategories()
            .then(res => {
                setCategories(res.data);
                if (res.data.length > 0) {
                    setCategoryId(res.data[0].id);
                }
            })
            .catch(() => toast.error("Could not load categories."));

    }, [isInternalUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            let response;
            if (isInternalUser) {
                if (!selectedCustomer) {
                    toast.error("Please select a customer.");
                    setIsSubmitting(false);
                    return;
                }
                const ticketData = { subject, description, priority, categoryId, requesterId: selectedCustomer.value };
                response = await ticketService.createTicketOnBehalfOf(ticketData, attachments);
            } else {
                const ticketData = { subject, description, priority, categoryId };
                response = await ticketService.createTicketAsCustomer(ticketData, attachments);
            }
            toast.success("Ticket created successfully!");
            navigate(`/tickets/${response.data.id}`);
        } catch (error) {
            toast.error(error.response?.data?.errorMessage || "Failed to create ticket.");
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length === 0) return;
        const filesWithIds = newFiles.map(file => Object.assign(file, {
            tempId: Math.random().toString(36).substring(2, 9)
        }));
        setAttachments(prev => {
            const existingFileNames = new Set(prev.map(f => f.name));
            const uniqueNewFiles = filesWithIds.filter(f => !existingFileNames.has(f.name));
            return [...prev, ...uniqueNewFiles];
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    const handleRemoveFile = (tempIdToRemove) => {
        setAttachments(prev => prev.filter(file => file.tempId !== tempIdToRemove));
    };

    const loadCustomerOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) {
            callback([]);
            return;
        }

        userService.searchCustomers(inputValue)
            .then(res => {
                const options = res.data.map(user => ({
                    value: user.id,
                    label: `${user.firstName} ${user.lastName} (${user.email})`
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };

    return (
        <Container fluid className="p-4">
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title as="h2" className="text-center mb-4">Create New Support Ticket</Card.Title>
                            <Form onSubmit={handleSubmit}>

                                {isInternalUser && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Create on behalf of Customer</Form.Label>
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions
                                            loadOptions={loadCustomerOptions}
                                            value={selectedCustomer}
                                            onChange={setSelectedCustomer}
                                            placeholder="Type to search for a customer..."
                                            noOptionsMessage={() => "No customers found"}
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3" controlId="formSubject">
                                    <Form.Label>Subject</Form.Label>
                                    <Form.Control type="text" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="e.g., Unable to login" />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={6} value={description} onChange={e => setDescription(e.target.value)} required placeholder="Please provide as much detail as possible..." />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formCategory">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPriority">
                                            <Form.Label>Priority</Form.Label>
                                            <Form.Select value={priority} onChange={e => setPriority(e.target.value)} required>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3" controlId="formAttachments">
                                    <Form.Label>Attachments</Form.Label>
                                    <Form.Control type="file" multiple ref={fileInputRef} onChange={handleFileChange} />
                                </Form.Group>

                                {attachments.length > 0 && (
                                    <ListGroup className="mb-3">
                                        {attachments.map((file) => (
                                            <ListGroup.Item key={file.tempId} className="d-flex justify-content-between align-items-center">
                                                <span><i className="bi bi-file-earmark me-2"></i>{file.name}</span>
                                                <Button variant="light" size="sm" onClick={() => handleRemoveFile(file.tempId)} aria-label="Remove file" className="p-1" style={{ lineHeight: 1 }}>
                                                    <i className="bi bi-x-lg"></i>
                                                </Button>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={isSubmitting} size="lg">
                                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CreateTicket;