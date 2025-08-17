import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Table, Button, Form, Row, Col, Badge, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AsyncSelect from 'react-select/async';
import { toast } from 'react-toastify';
import ticketService from '../../services/ticketService';
import userService from '../../services/userService';
import { UserContext } from '../common/UserContext';
import { checkIfHasRole } from '../../utils/roleUtils';
import '../../style/AdminTable.css';

const DEBOUNCE_DELAY = 500;

function TicketList() {
    const { user, role } = useContext(UserContext);
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const unassignedOption = { value: -1, label: 'Unassigned' };

    const [filters, setFilters] = useState({
        subject: '',
        status: null,
        priority: null,
        requesterId: null,
        assignedToId: null,
        assigneeFilter: 'mine',
    });

    const [sortField, setSortField] = useState('updatedAt');
    const [sortDir, setSortDir] = useState('desc');

    const isCustomer = checkIfHasRole(role, 'ROLE_CUSTOMER');
    const isAgent = checkIfHasRole(role, 'ROLE_SUPPORT_AGENT');
    const isSupervisorOrAdmin = checkIfHasRole(role, ['ROLE_SUPERVISOR', 'ROLE_ADMIN']);

    const fetchTickets = useCallback(async (page, size, currentFilters, field, dir) => {
        setIsLoading(true);
        try {
            const apiFilters = {
                subject: currentFilters.subject,
                status: currentFilters.status,
                priority: currentFilters.priority,
                requesterId: currentFilters.requesterId,
                assignedToId: currentFilters.assignedToId
            };

            if (isCustomer) {
                apiFilters.requesterId = user.id;
            } else if (isAgent) {
                if (currentFilters.assigneeFilter === 'mine') {
                    apiFilters.assignedToId = user.id;
                } else if (currentFilters.assigneeFilter === 'unassigned') {
                    apiFilters.assignedToId = -1;
                }
            }

            const response = await ticketService.getTickets(page, size, apiFilters, field, dir);
            setTickets(response.data.content);
            setTotalPages(response.data.page?.totalPages || 0);
        } catch (err) {
            toast.error(err.response.data?.errorMessage || "Failed to fetch tickets.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, isCustomer, isAgent]);

    useEffect(() => {
        if (!user) return;
        const handler = setTimeout(() => {
            setCurrentPage(0);
            fetchTickets(0, pageSize, filters, sortField, sortDir);
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [user, filters, pageSize, sortField, sortDir, fetchTickets]);

    const loadUserOptions = (inputValue, callback) => {
        if (!inputValue || inputValue.length < 2) return callback([]);
        userService.searchCustomers(inputValue)
            .then(res => {
                const options = res.data.map(u => ({
                    value: u.id,
                    label: `${u.firstName} ${u.lastName} (${u.email})`
                }));
                callback(options);
            })
            .catch(() => callback([]));
    };

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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handlePageSizeChange = (e) => setPageSize(parseInt(e.target.value, 10));

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            fetchTickets(newPage, pageSize, filters, sortField, sortDir);
        }
    };

    const handleSort = (field) => {
        const newSortDir = (field === sortField && sortDir === 'desc') ? 'asc' : 'desc';
        setSortField(field);
        setSortDir(newSortDir);
    };

    const SortableHeader = ({ field, children }) => {
        const isSorted = sortField === field;
        const icon = isSorted ? (sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down') : 'bi-arrow-down-up';
        return <th onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>{children} <i className={`bi ${icon} ms-1`}></i></th>;
    };

    if (isLoading && !tickets.length) {
        return <Container fluid className="p-4 text-center">Loading...</Container>;
    }

    return (
        <Container fluid className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>{isCustomer ? 'My Support Tickets' : 'Support Tickets'}</h1>
                <LinkContainer to="/tickets/new">
                    <Button variant="primary"><i className="bi bi-plus-circle me-2"></i>Create New Ticket</Button>
                </LinkContainer>
            </div>

            <Row className="mb-3 gx-3 gy-2">
                <Col xs={12} lg={isSupervisorOrAdmin ? 4 : 12}>
                    <Form.Control type="text" name="subject" placeholder="Search by subject..." value={filters.subject || ''} onChange={handleFilterChange} />
                </Col>

                {isSupervisorOrAdmin && (
                    <>
                        <Col xs={12} lg={4}>
                            <AsyncSelect isClearable cacheOptions defaultOptions loadOptions={loadUserOptions} placeholder="Filter by Requester..."
                                         onChange={(selectedOption) => setFilters(p => ({ ...p, requesterId: selectedOption ? selectedOption.value : null }))} />
                        </Col>
                        <Col xs={12} lg={4}>
                            <AsyncSelect isClearable cacheOptions defaultOptions={[unassignedOption]} loadOptions={loadStaffOptions} placeholder="Filter by Assignee..."
                                         onChange={(selectedOption) => setFilters(p => ({ ...p, assignedToId: selectedOption ? selectedOption.value : null }))} />
                        </Col>
                    </>
                )}
            </Row>

            <Row className="mb-3 gx-3 gy-2 align-items-center">
                <Col xs={6} lg={2}>
                    <Form.Select name="status" value={filters.status || ''} onChange={handleFilterChange} size="sm">
                        <option value="">All Statuses</option>
                        <option value="NEW">New</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="WAITING_CUSTOMER">Waiting Customer</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </Form.Select>
                </Col>
                <Col xs={6} lg={2}>
                    <Form.Select name="priority" value={filters.priority || ''} onChange={handleFilterChange} size="sm">
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </Form.Select>
                </Col>
                <Col xs={12} lg="auto">
                    {isAgent && (
                        <ButtonGroup size="w-100">
                            <ToggleButton
                                type="radio"
                                name="assigneeToggle"
                                value="mine"
                                variant={filters.assigneeFilter === 'mine' ? 'primary' : 'outline-primary'}
                                checked={filters.assigneeFilter === 'mine'}
                                onChange={() => setFilters(p => ({ ...p, assigneeFilter: 'mine' }))}
                                className="text-nowrap"
                                id="myTicketsToggle">
                                My Tickets
                            </ToggleButton>
                            <ToggleButton
                                type="radio"
                                name="assigneeToggle"
                                value="unassigned"
                                variant={filters.assigneeFilter === 'unassigned' ? 'primary' : 'outline-primary'}
                                checked={filters.assigneeFilter === 'unassigned'}
                                onChange={() => setFilters(p => ({ ...p, assigneeFilter: 'unassigned' }))}
                                className="text-nowrap"
                                id="UnassignedToggle"
                            >
                                Unassigned
                            </ToggleButton>
                        </ButtonGroup>
                    )}
                </Col>

                <Col xs={"auto"} lg={"auto"} className="ms-auto">
                    <Form.Select value={pageSize} onChange={handlePageSizeChange} style={{ width: '120px' }} size="sm">
                        <option value="10">10 / page</option>
                        <option value="50">50 / page</option>
                        <option value="100">100 / page</option>
                    </Form.Select>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="responsive-table">
                <thead>
                <tr>
                    <SortableHeader field="id">ID</SortableHeader>
                    <SortableHeader field="subject">Subject</SortableHeader>
                    {!isCustomer && <SortableHeader field="requester.firstName">Requester</SortableHeader>}
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="priority">Priority</SortableHeader>
                    {!isCustomer && <SortableHeader field="assignedTo.firstName">Assignee</SortableHeader>}
                    <SortableHeader field="updatedAt">Last Updated</SortableHeader>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr><td colSpan={isCustomer ? "5" : "7"} className="text-center p-4"><em>Loading...</em></td></tr>
                ) : tickets.length > 0 ? (
                    tickets.map(ticket => (
                        <tr key={ticket.id}>
                            <td data-label="ID"><LinkContainer to={`/tickets/${ticket.id}`}><a href={`/tickets/${ticket.id}`}>{ticket.id}</a></LinkContainer></td>
                            <td data-label="Subject">{ticket.subject}</td>
                            {!isCustomer && <td data-label="Requester">{ticket.requester.fullName}</td>}
                            <td data-label="Status"><Badge bg="primary">{ticket.status.replace('_', ' ')}</Badge></td>
                            <td data-label="Priority">{ticket.priority}</td>
                            {!isCustomer && <td data-label="Assignee">{ticket.assignedTo?.fullName || 'Unassigned'}</td>}
                            <td data-label="Last Updated">{new Date(ticket.updatedAt).toLocaleString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={isCustomer ? "5" : "7"} className="text-center p-4">No tickets found matching your criteria.</td></tr>
                )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <nav><ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button></li>
                    <li className="page-item disabled"><span className="page-link">Page {currentPage + 1} of {totalPages}</span></li>
                    <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button></li>
                </ul></nav>
            )}
        </Container>
    );
}

export default TicketList;