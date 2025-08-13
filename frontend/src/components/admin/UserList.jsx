import React, { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../UserContext.jsx';
import { Navigate } from 'react-router-dom';
import userService from "../../services/userService.js";
import '../../style/UserList.css';
import Button from "react-bootstrap/Button";
import EditUserModal from "./EditUserModal.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import CreateUserModal from "./CreateUserModal.jsx"; // We'll add some simple CSS for the overlay
import { formatRoleForDisplay, formatRoleForAPI } from '../../utils/roleUtils.js'; // Adjust the path as needed
import { toast } from 'react-toastify'; // Import the toast function

const PAGE_SIZE = 10;
const DEBOUNCE_DELAY = 500; // ms

const UserList = () => {
    const { role } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    // --- STATE MANAGEMENT ---
    // We now have two loading states for a better UX
    const [isInitialLoading, setIsInitialLoading] = useState(true); // For the very first load
    const [isTableLoading, setIsTableLoading] = useState(false); // For subsequent filtering/paging
    const [availableRoles, setAvailableRoles] = useState([]); // State for roles from API

    // Pagination and Filter State
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({ firstName: '', lastName: '', email: '' });

    // --- NEW STATE for managing the modal ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // The user to be edited
    const [userToDelete, setUserToDelete] = useState(null); // State for the user targeted for deletion

    // --- DEBOUNCING LOGIC ---
    // This effect runs whenever the live 'filters' state changes.
    // It waits for the user to stop typing, then triggers the API call effect.
    useEffect(() => {
        const handler = setTimeout(() => {
            // When the timer fires, fetch the data with the new filters, resetting to page 0
            setCurrentPage(0);
            fetchUsers(0, filters);
        }, DEBOUNCE_DELAY);

        // This cleanup function is crucial. It clears the pending timeout on every keystroke.
        return () => {
            clearTimeout(handler);
        };
    }, [filters]); // This effect depends only on the live filter inputs

    // --- DATA FETCHING ---
    const fetchUsers = useCallback(async (page, currentFilters) => {
        // Set the appropriate loading state. Don't use the initial loader for filtering.
        setIsTableLoading(true);
        setError(null);

        try {
            const data = await userService.getAllUsersPaged(page, PAGE_SIZE, currentFilters);
            setUsers(data.content || []);
            setTotalPages(data.page?.totalPages || 0);
        } catch (err) {
            setError(err.message);
        } finally {
            // Always turn off loading states when done
            setIsTableLoading(false);
            setIsInitialLoading(false);
        }
    }, []); // This function is memoized and doesn't need dependencies

    // --- INITIAL DATA LOAD ---
    // This effect runs only once when the component mounts to get the initial user list.
    useEffect(() => {
        if (role === 'ROLE_ADMIN') {
            const fetchInitialData = async () => {
                try {
                    // Use Promise.all to run both API calls concurrently for speed
                    const [rolesData, usersData] = await Promise.all([
                        userService.getAllRoles(),
                        userService.getAllUsersPaged(0, PAGE_SIZE, {})
                    ]);

                    setAvailableRoles(rolesData || []);
                    setUsers(usersData.content || []);
                    setTotalPages(usersData.totalPages || 0);

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
    }, [role]); // Note: 'filters' is not needed here

    // --- EVENT HANDLERS ---
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        // This is a fast state update that just updates the input field's value
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            // Manually trigger fetch for page changes
            fetchUsers(newPage, filters);
        }
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

    // This function is called when the "Yes, Delete" button in the modal is clicked
    const handleConfirmDelete = async () => {
        if (!userToDelete) return; // Safety check

        try {
            await userService.deleteUser(userToDelete.id);
            toast.success(`User "${userToDelete.firstName} ${userToDelete.lastName}" has been deleted`);
            handleCloseDeleteModal(); // Close the modal on success
            // Refresh the user list to show the user has been removed
            fetchUsers(currentPage, filters);
        } catch (err) {
            const errorMessage = err?.response?.data?.errorMessage || "Failed to delete user.";
            toast.error(errorMessage);
            handleCloseDeleteModal(); // Also close modal on error
        }
    };

    // This function is now passed to the modal
    const handleSaveChanges = async (userId, displayRole) => {
        const roleForApi = formatRoleForAPI(displayRole);
        try {
            await userService.editUserRole(userId, roleForApi);
            toast.success("User role updated successfully!");
            handleCloseEditModal(); // Close the modal on success
            fetchUsers(currentPage, filters); // Refresh the list
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
            // Fetch the first page to see the new user.
            // You might need to adjust sorting if you want them at the top.
            fetchUsers(0, {});
        } catch (err) {
            const errorMessage = err?.response?.data?.errorMessage || "An unexpected error occurred while creating the user.";
            toast.error(errorMessage);
        }
    };

    // --- RENDER LOGIC ---

    // Use a full-screen loader ONLY on the very first mount
    if (isInitialLoading) return <div className="container mt-4">Loading...</div>;
    if (error) return <div className="container mt-4 alert alert-danger">Error: {error}</div>;
    if (role !== 'ROLE_ADMIN') return <Navigate to="/" />;

    return (
        <>

            <div className="container-fluid mt-4">
                <div className="d-flex justify-content-start mb-3">
                    <Button variant="primary" onClick={handleOpenCreateModal}>
                        <i className="bi bi-plus-circle me-2"></i> {/* Optional but recommended icon */}
                        Create User
                    </Button>
                    {/* You could easily add more buttons here in the future */}
                    {/* <Button variant="outline-secondary" className="ms-2">Export</Button> */}
                </div>
                <div className="text-center mb-4">
                    <h2>User Management</h2>
                </div>
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>
                                    First Name
                                    <input
                                        type="text" name="firstName" className="form-control form-control-sm mt-1"
                                        placeholder="Filter..." value={filters.firstName} onChange={handleFilterChange}
                                    />
                                </th>
                                <th>
                                    Last Name
                                    <input
                                        type="text" name="lastName" className="form-control form-control-sm mt-1"
                                        placeholder="Filter..." value={filters.lastName} onChange={handleFilterChange}
                                    />
                                </th>
                                <th>
                                    Email
                                    <input
                                        type="text" name="email" className="form-control form-control-sm mt-1"
                                        placeholder="Filter..." value={filters.email} onChange={handleFilterChange}
                                    />
                                </th>
                                <th>Role</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        {/* FIX: The entire tbody content is now conditionally rendered with valid HTML */}
                        <tbody>
                            {isTableLoading ? (
                                // State 1: Loading
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                // State 2: Data available
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.firstName}</td>
                                        <td>{u.lastName}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className="badge bg-secondary">{formatRoleForDisplay(u.authorities?.[0])}</span>
                                        </td>
                                        <td className="text-center">
                                            <Button variant="outline-primary" size="sm" onClick={() => handleOpenEditModal(u)}>
                                                Edit
                                            </Button>
                                            <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleOpenDeleteModal(u)}>
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                // State 3: No results
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination controls */}
                {totalPages > 1 && (
                    <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                            </li>
                            <li className="page-item disabled">
                                <span className="page-link">Page {currentPage + 1} of {totalPages}</span>
                            </li>
                            <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>

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
                userName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : ''}
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