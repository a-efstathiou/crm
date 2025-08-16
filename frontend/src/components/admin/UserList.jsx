import React, {useCallback, useContext, useEffect, useState} from 'react';
import {UserContext} from '../common/UserContext.jsx';
import {Navigate} from 'react-router-dom';
import userService from "../../services/userService.js";
import '../../style/UserList.css';
import EditUserModal from "./EditUserModal.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import CreateUserModal from "./CreateUserModal.jsx";
import {formatRoleForAPI, formatRoleForDisplay} from '../../utils/roleUtils.js';
import {toast} from 'react-toastify';
import { Container, Button, Table, Form } from 'react-bootstrap';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import '../../style/AdminTable.css';

const DEBOUNCE_DELAY = 500; // ms

const UserList = () => {
    const { role } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState({ firstName: '', lastName: '', email: '' });

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = useCallback(async (page, size, currentFilters) => {
        setIsTableLoading(true);
        setError(null);

        try {
            const data = await userService.getAllUsersPaged(page, size, currentFilters);
            setUsers(data.content || []);
            setTotalPages(data.page?.totalPages || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsTableLoading(false);
            setIsInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(0);
            fetchUsers(0, pageSize, filters);
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(handler);
        };
    }, [fetchUsers, filters, pageSize]);

    useEffect(() => {
        if (role === 'ROLE_ADMIN') {
            const fetchInitialData = async () => {
                try {
                    const [rolesData, usersData] = await Promise.all([
                        userService.getAllRoles(),
                        userService.getAllUsersPaged(0, pageSize, {})
                    ]);

                    setAvailableRoles(rolesData || []);
                    setUsers(usersData.content || []);
                    setTotalPages(usersData.page?.totalPages || 0);

                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsInitialLoading(false);
                }
            };
            fetchInitialData();
        } else {
            setIsInitialLoading(false);
        }
    }, [role]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            fetchUsers(newPage, pageSize, filters);
        }
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value, 10));
    };

    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
    };
    const handleOpenDeleteModal = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };
    const handleOpenCreateModal = () => setShowCreateModal(true);
    const handleCloseCreateModal = () => setShowCreateModal(false);
    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await userService.deleteUser(userToDelete.id);
            toast.success(`User "${userToDelete.firstName} ${userToDelete.lastName}" has been deleted`);
            handleCloseDeleteModal();

            let pageToFetch = currentPage;
            if (users.length === 1 && currentPage > 0) {
                pageToFetch = currentPage - 1;
            }

            await fetchUsers(pageToFetch, pageSize, filters);
        } catch (err) {
            const errorMessage = err?.response?.data?.errorMessage || "Failed to delete user.";
            toast.error(errorMessage);
            handleCloseDeleteModal();
        }
    };

    const handleSaveChanges = async (updatedUserData) => {
        updatedUserData.role = formatRoleForAPI(updatedUserData.role);

        try {
            await userService.updateUser(updatedUserData);
            toast.success("User role updated successfully!");
            handleCloseEditModal();
            await fetchUsers(currentPage, pageSize, filters);
        } catch (err) {
            const errorMessage = err?.response?.data?.errorMessage || "Failed to update role.";
            toast.error(errorMessage);
        }
    };

    const handleCreateUser = async (newUserData) => {
        try {
            await userService.createUser(newUserData);
            toast.success(`User "${newUserData.firstName} ${newUserData.lastName}"  created successfully!`);
            handleCloseCreateModal();
            await fetchUsers(0, pageSize, {});
        } catch (err) {
            const errorMessage = err?.response?.data?.errorMessage || "An unexpected error occurred while creating the user.";
            toast.error(errorMessage);
        }
    };

    if (isInitialLoading) return <div className="container mt-4">Loading...</div>;
    if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;
    if (role !== 'ROLE_ADMIN') return <Navigate to="/" />;

    return (
        <>
            <Container fluid className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>User Management</h1>
                    <Button variant="primary" onClick={handleOpenCreateModal}>
                        <i className="bi bi-plus-circle me-2"></i>Create User
                    </Button>
                </div>

                <Row className="mb-3 gx-2 gy-2 align-items-center">
                    {/* --- Column 1: First Name Filter --- */}
                    <Col xs={12} md={4} lg={3}>
                        <Form.Control
                            type="text"
                            name="firstName"
                            placeholder="Filter by first name..."
                            value={filters.firstName}
                            onChange={handleFilterChange}
                        />
                    </Col>

                    {/* --- Column 2: Last Name Filter --- */}
                    <Col xs={12} md={4} lg={3}>
                        <Form.Control
                            type="text"
                            name="lastName"
                            placeholder="Filter by last name..."
                            value={filters.lastName}
                            onChange={handleFilterChange}
                        />
                    </Col>

                    {/* --- Column 3: Email Filter --- */}
                    <Col xs={12} md={4} lg={3}>
                        <Form.Control
                            type="text"
                            name="email"
                            placeholder="Filter by email..."
                            value={filters.email}
                            onChange={handleFilterChange}
                        />
                    </Col>

                    {/* --- Column 4: Spacer --- */}
                    <Col xs="auto" className="me-auto d-none d-lg-block"></Col>

                    {/* --- Column 5: Page Size Selector --- */}
                    <Col xs="auto">
                        <Form.Select value={pageSize} onChange={handlePageSizeChange} style={{ width: '120px' }}>
                            <option value="10">10 / page</option>
                            <option value="50">50 / page</option>
                            <option value="100">100 / page</option>
                        </Form.Select>
                    </Col>
                </Row>

                <Table striped bordered hover responsive className="responsive-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th className="text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isTableLoading ? (
                        <tr><td colSpan="5" className="text-center p-4"><div className="spinner-border text-primary"><span className="visually-hidden">Loading...</span></div></td></tr>
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td data-label="ID">{user.id}</td>
                                <td data-label="First Name">{user.firstName}</td>
                                <td data-label="Last Name">{user.lastName}</td>
                                <td data-label="Email">{user.email}</td>
                                <td data-label="Role"><span className="badge bg-secondary">{formatRoleForDisplay(user.authorities?.[0])}</span></td>
                                <td className="text-center" data-label="Actions">
                                    <Button variant="outline-primary" size="sm" onClick={(e) => { handleOpenEditModal(user); e.currentTarget.blur(); }}>Edit</Button>
                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={(e) => { handleOpenDeleteModal(user); e.currentTarget.blur(); }}>Delete</Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="text-center p-4">No users found matching your criteria.</td></tr>
                    )}
                    </tbody>
                </Table>

                {totalPages > 1 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                                    Previous
                                </button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                            </li>
                            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}
            </Container>

            <EditUserModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                user={selectedUser}
                availableRoles={availableRoles}
                onSave={handleSaveChanges}
            />
            <DeleteConfirmationModal
                show={showDeleteModal}
                onHide={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                itemType="user"
                itemName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ''}
                isPermanent={true}
            />
            <CreateUserModal
                show={showCreateModal}
                onHide={handleCloseCreateModal}
                availableRoles={availableRoles}
                onSave={handleCreateUser}
            />
        </>
    );
};

export default UserList;