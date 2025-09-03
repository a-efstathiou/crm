import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Tabs, Tab, ListGroup, Badge, Table } from 'react-bootstrap';
import {Link, useParams} from 'react-router-dom';
import ticketService from '../../services/ticketService';
import attachmentService from "../../services/attachmentService.js";
import auditLogService from '../../services/auditLogService';
import { UserContext } from '../common/UserContext';
import { checkIfHasRole } from '../../utils/roleUtils';
import { toast } from 'react-toastify';
import './TicketDetail.css';
import BusinessProcessFlow from './BusinessProcessFlow.jsx';
import AssignTicketModal from './AssignTicketModal';
import UpdateTicketModal from './UpdateTicketModal.jsx';
import AddAttachmentModal from './AddAttachmentModal';

function TicketDetail() {
    const {ticketId} = useParams();
    const {user, role} = useContext(UserContext);

    // Data state
    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [newComment, setNewComment] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);

    const [activeTab, setActiveTab] = useState('conversation');

    const isUnassigned = ticket && !ticket.assignedTo;
    const canViewAuditing = checkIfHasRole(role, ['ROLE_SUPERVISOR', 'ROLE_ADMIN']);
    const isTicketOpen = ticket && (ticket.status === 'NEW' || ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'WAITING_CUSTOMER');
    const isTicketResolved = ticket && ticket.status === 'RESOLVED';
    const isTicketClosed = ticket && ticket.status === 'CLOSED';
    const canUpdate = checkIfHasRole(role, ['ROLE_SUPPORT_AGENT', 'ROLE_SUPERVISOR', 'ROLE_ADMIN']) && !isTicketClosed;
    const canAssign = checkIfHasRole(role, ['ROLE_SUPERVISOR', 'ROLE_ADMIN']) && !isTicketClosed;
    const canClaim = checkIfHasRole(role, 'ROLE_SUPPORT_AGENT') && isUnassigned && !isTicketClosed;

    const fetchData = useCallback(async () => {
        if (!ticketId) return;
        setIsLoading(true);
        setError(null);
        try {
            const promises = [
                await ticketService.getTicketById(ticketId),
                await ticketService.getComments(ticketId)
            ];

            if (canViewAuditing) {
                promises.push(auditLogService.getAuditLogs(ticketId));
            }

            const results = await Promise.all(promises);

            setTicket(results[0].data);
            setComments(results[1].data);

            if (canViewAuditing && results[2]) {
                setAuditLogs(results[2].data);
            }

        } catch (err) {
            const msg = err.response?.data?.errorMesage || "Failed to load ticket details.";
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [ticketId, canViewAuditing]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const commentData = {content: newComment, isInternalNote};
        try {
            await ticketService.addComment(ticketId, commentData);
            toast.success("Reply added!");
            setNewComment('');
            setIsInternalNote(false);
            await fetchData();
        } catch (error) {
            toast.error(error.response?.data?.errorMesage || "Failed to add reply.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClaimTicket = async () => {
        const updateData = { assignedToId: user.id, status: 'OPEN' };
        try {
            await ticketService.updateTicket(ticketId, updateData);
            toast.success("You have claimed this ticket!");
            fetchData(); // Refresh the page data
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to claim ticket.");
        }
    };

    const handleAssignTicket = async (assigneeId) => {
        const updateData = { assignedToId: assigneeId, status: 'OPEN' };
        try {
            await ticketService.updateTicket(ticketId, updateData);
            toast.success("Ticket has been assigned!");
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to assign ticket.");
        }
    };

    const handleUpdateProperties = async (updateData) => {
        try {
            const finalUpdateData = { ...updateData, subject: ticket.subject };
            await ticketService.updateTicket(ticketId, finalUpdateData);
            toast.success("Ticket properties updated!");
            setShowUpdateModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to update ticket.");
        }
    };

    const handleDownload = async (attachmentId, fileName) => {
        setDownloadingId(attachmentId);
        try {
            await attachmentService.downloadAttachment(attachmentId, fileName);
        }
        catch (error) {
            toast.error(error.response?.data?.errorMesage || "Failed to download attachment.");
        }
        setDownloadingId(null);
    };

    const handleResolveTicket = async () => {
        const updateData = {
            subject: ticket.subject,
            status: 'RESOLVED',
            priority: ticket.priority,
            categoryId: ticket.category.id,
            assignedToId: ticket.assignedTo?.id
        };
        try {
            await ticketService.updateTicket(ticketId, updateData);
            toast.success("Ticket has been marked as Resolved!");
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to update ticket status.");
        }
    };

    const handleReopenTicket = async () => {
        const updateData = {
            subject: ticket.subject,
            status: 'IN_PROGRESS', // Re-open to In Progress
            priority: ticket.priority,
            categoryId: ticket.category.id,
            assignedToId: ticket.assignedTo?.id
        };
        try {
            await ticketService.updateTicket(ticketId, updateData);
            toast.info("Ticket has been re-opened.");
            fetchData();
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to re-open ticket.");
        }
    };

    const handleAddAttachments = async (files) => {
        try {
            await ticketService.addAttachments(ticketId, files);
            toast.success(`${files.length} file(s) uploaded successfully!`);
            setShowAddAttachmentModal(false);
            fetchData(); // Refresh all ticket data to update the attachments tab
        } catch (error) {
            toast.error(error.response.data?.errorMessage || "Failed to upload files.");
        }
    };

    if (isLoading) {
        return <Container fluid className="p-4 text-center"><Spinner animation="border"/></Container>;
    }
    if (error) {
        return <Container fluid className="p-4">
            <div className="alert alert-danger">{error}</div>
        </Container>;
    }
    if (!ticket) {
        return <Container fluid className="p-4"><h2>Ticket Not Found</h2></Container>;
    }

    return (
        <>
            <Container fluid className="p-4">
                <div className="action-bar d-flex align-items-center gap-2 mb-4 p-2 bg-light border rounded">
                    {canClaim && (
                        <Button variant="success" size="sm" onClick={handleClaimTicket}><i className="bi bi-person-check-fill me-2"></i>Claim</Button>
                    )}
                    {canAssign && (
                        <Button variant="primary" size="sm" onClick={() => setShowAssignModal(true)}><i className="bi bi-people-fill me-2"></i>Assign</Button>
                    )}
                    {canUpdate && isTicketOpen && (
                        <Button variant="success" size="sm" onClick={handleResolveTicket}>
                            <i className="bi bi-check2-circle me-2"></i>Mark as Resolved
                        </Button>
                    )}

                    {canUpdate && isTicketResolved && (
                        <Button variant="warning" size="sm" onClick={handleReopenTicket}>
                            <i className="bi bi-arrow-counterclockwise me-2"></i>Re-open Ticket
                        </Button>
                    )}

                    {canUpdate && (
                        <>
                            <Button variant="outline-secondary" size="sm" onClick={() => setShowUpdateModal(true)}>
                                <i className="bi bi-pencil-square me-2"></i>Edit Properties
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => setShowAddAttachmentModal(true)}>
                                <i className="bi bi-paperclip me-2"></i>Add Attachments
                            </Button>
                        </>
                    )}
                </div>

                <div className="ticket-header">
                    <h1>{ticket.subject}</h1>
                    <div className="ticket-meta-container">
                        <div className="ticket-meta-item">
                            <span className="meta-label">Status</span>
                            <Badge bg="primary" className="meta-value p-2">{ticket.status}</Badge>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="meta-label">Priority</span>
                            <span className="meta-value">{ticket.priority}</span>
                        </div>
                        <div className="ticket-meta-item">
                            <span className="meta-label">Assignee</span>
                            <span className="meta-value">{ticket.assignedTo?.fullName || 'Unassigned'}</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <BusinessProcessFlow currentStatus={ticket.status}/>
                </div>

                <Row>
                    <Col lg={8}>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(key) => setActiveTab(key)}
                            defaultActiveKey="conversation"
                            id="ticket-tabs"
                            className="mb-3"
                        >
                            <Tab eventKey="conversation" title="Conversation">
                                <div className="comment-thread mt-4">
                                    <div className="comment">
                                        <div className="comment-header">
                                            <span className="comment-author">{ticket.requester.fullName}</span>
                                            <small className="text-muted">Created
                                                on {new Date(ticket.createdAt).toLocaleString()}</small>
                                        </div>
                                        <p style={{whiteSpace: 'pre-wrap'}}>{ticket.description}</p>
                                    </div>
                                    {comments.map(comment => (
                                        <div key={comment.id}
                                             className={`comment ${comment.isInternalNote ? 'internal-note' : ''}`}>
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.authorFullName}</span>
                                                <small
                                                    className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
                                            </div>
                                            {comment.isInternalNote &&
                                                <Badge bg="warning" className="mb-2">Internal Note</Badge>}
                                            <p style={{whiteSpace: 'pre-wrap'}}>{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </Tab>
                            <Tab eventKey="attachments" title={`Attachments (${ticket.attachments.length})`}>
                                <Card>
                                    <ListGroup variant="flush" className="attachment-list">
                                        {ticket.attachments.length > 0 ? (
                                            ticket.attachments.map(att => (
                                                <ListGroup.Item key={att.id} className="p-2">
                                                    <Row className="align-items-center">

                                                        <Col>
                                                            <i className="bi bi-file-earmark me-2"></i>
                                                            {att.fileName}
                                                        </Col>

                                                        <Col xs="auto">
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                disabled={downloadingId === att.id}
                                                                onClick={() => handleDownload(att.id, att.fileName)}
                                                            >
                                                                <i className={`bi ${downloadingId === att.id ? 'bi-hourglass-split' : 'bi-download'} me-2`}></i>
                                                                {downloadingId === att.id ? 'Downloading...' : 'Download'}
                                                            </Button>
                                                        </Col>

                                                    </Row>
                                                </ListGroup.Item>
                                            ))
                                        ) : (
                                            <ListGroup.Item>
                                                <p className="text-muted text-center mb-0">No attachments for this ticket.</p>
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card>
                            </Tab>
                            {canViewAuditing && (
                                <Tab eventKey="auditing" title="History">
                                    <Card>
                                        <Card.Body>
                                            <Table striped responsive size="sm">
                                                <thead>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <th>User</th>
                                                    <th>Action</th>
                                                    <th>Details</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {auditLogs.map(log => (
                                                    <tr key={log.id}>
                                                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                        <td>{log.actorFullName || 'System'}</td>
                                                        <td><Badge bg="info">{log.action}</Badge></td>
                                                        <td>{log.details}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Tab>
                            )}
                        </Tabs>
                    </Col>

                    <Col lg={4}>
                        <Card className="mb-3">
                            <Card.Header as="h5">Ticket Details</Card.Header>
                            <Card.Body>
                                <p><strong>Ticket ID:</strong> #{ticket.id}</p>
                                <p><strong>Category:</strong> {ticket.category.name}</p>
                                <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
                                <p><strong>Last Update:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
                                {ticket.resolvedAt &&
                                    <p><strong>Resolved:</strong> {new Date(ticket.resolvedAt).toLocaleString()}</p>}
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Header as="h5">Customer</Card.Header>
                            <Card.Body>
                                <p><strong>Name:</strong> {ticket.requester.fullName}</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                {activeTab === 'conversation' && (
                    !isTicketClosed ? (
                        <Row className="mt-4">
                            <Col lg={8}>
                                <Card>
                                    <Card.Body>
                                        <Card.Title>Add Your Reply</Card.Title>
                                        <Form onSubmit={handleCommentSubmit}>
                                            <Form.Group className="mb-3">
                                                <Form.Control as="textarea" rows={4} value={newComment}
                                                              onChange={e => setNewComment(e.target.value)} required
                                                              placeholder="Type your response here..."/>
                                            </Form.Group>
                                            {canUpdate && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <Form.Check type="checkbox" id="internal-note-checkbox" checked={isInternalNote}
                                                                onChange={e => setIsInternalNote(e.target.checked)}
                                                                className="m-0"/>
                                                    <Form.Label htmlFor="internal-note-checkbox" className="mb-0">Make this an
                                                        internal note</Form.Label>
                                                </div>
                                            )}
                                            <Button variant="primary" type="submit" className="mt-3" disabled={isSubmitting}>
                                                {isSubmitting ? 'Submitting...' : 'Submit Reply'}
                                            </Button>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Row className="mt-4">
                            <Col lg={8}>
                                <div className="alert alert-info text-center">
                                    This ticket is closed. To report a new issue, please <Link to="/tickets/new">create a new ticket</Link>.
                                </div>
                            </Col>
                        </Row>
                    )
                )}
            </Container>

            <AddAttachmentModal
                show={showAddAttachmentModal}
                onHide={() => setShowAddAttachmentModal(false)}
                onSave={handleAddAttachments}
            />

            <AssignTicketModal
                show={showAssignModal}
                onHide={() => setShowAssignModal(false)}
                onSave={handleAssignTicket}
            />

            <UpdateTicketModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                onSave={handleUpdateProperties}
                ticket={ticket}
            />
        </>
    );

}

export default TicketDetail;