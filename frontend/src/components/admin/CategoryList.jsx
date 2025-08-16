import React, {useState, useEffect, useCallback, useContext} from 'react';
import { Container, Button, Table, ButtonGroup, ToggleButton, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import categoryService from '../../services/categoryService.js';
import CreateCategoryModal from './CreateCategoryModal.jsx';
import EditCategoryModal from './EditCategoryModal.jsx';
import DeleteConfirmationModal from '../admin/DeleteConfirmationModal.jsx';
import {Navigate} from "react-router-dom";
import {UserContext} from "../common/UserContext.jsx";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "../../style/AdminTable.css";

const DEBOUNCE_DELAY = 500;

function CategoryList() {
    const { role } = useContext(UserContext);

    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState({ name: '', isActive: null });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = useCallback(async (page, size, currentFilters) => {
        setIsTableLoading(true);
        setError(null);
        try {
            // Prepare filters for the API. We don't send 'isActive' if it's 'all' (null).
            const apiFilters = { name: currentFilters.name };
            if (currentFilters.isActive !== null) {
                apiFilters.isActive = currentFilters.isActive;
            }

            const response = await categoryService.getAllCategoriesPaged(page, size, apiFilters);
            setCategories(response.data.content || []);
            setTotalPages(response.data.page?.totalPages || 0);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to fetch categories.");
        } finally {
            setIsTableLoading(false);
            setIsInitialLoading(false);
        }
    }, []);

    // This effect triggers a refetch whenever filters or pagination settings change
    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(0);
            fetchCategories(0, pageSize, filters);
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [filters, pageSize, fetchCategories]);


    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    const handleStatusFilterChange = (value) => {
        let isActiveValue;
        if (value === 'active') isActiveValue = true;
        else if (value === 'inactive') isActiveValue = false;
        else isActiveValue = null; // 'all'
        setFilters(prevFilters => ({ ...prevFilters, isActive: isActiveValue }));
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value, 10));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            // Fetch data for the new page, but don't reset filters
            fetchCategories(newPage, pageSize, filters);
        }
    };

    // --- CRUD Handlers ---
    const handleCreateCategory = async (categoryName) => {
        try {
            await categoryService.createCategory(categoryName);
            toast.success("Category created successfully!");
            setShowCreateModal(false);
            fetchCategories(0, pageSize, filters);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create category.");
        }
    };

    const handleSaveChanges = async (categoryId, categoryName) => {
        try {
            await categoryService.updateCategory(categoryId, categoryName);
            toast.success("Category updated successfully!");
            setShowEditModal(false);
            fetchCategories(currentPage, pageSize, filters);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update category.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await categoryService.deleteCategory(categoryToDelete.id);
            toast.success(`Category "${categoryToDelete.name}" has been disabled.`);
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            fetchCategories(currentPage, pageSize, filters);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to disable category.");
            setShowDeleteModal(false);
        }
    };

    const handleEnableCategory = async (categoryId) => {
        try {
            await categoryService.enableCategory(categoryId); // Assumes this service method exists
            toast.success("Category has been enabled.");
            fetchCategories(currentPage, pageSize, filters);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to enable category.");
        }
    };

    // --- Modal Open/Close Handlers ---
    const handleOpenEditModal = (category) => { setSelectedCategory(category); setShowEditModal(true); };
    const handleOpenDeleteModal = (category) => { setCategoryToDelete(category); setShowDeleteModal(true); };

    if (isInitialLoading) return <Container fluid className="p-4">Loading...</Container>;
    if (error) return <Container fluid className="p-4 alert alert-danger">Error: {error}</Container>;
    if (role !== 'ROLE_ADMIN') return <Navigate to="/" />;

    return (
        <>
            <Container fluid className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1>Category Management</h1>
                    <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        <i className="bi bi-plus-circle me-2"></i>Create Category
                    </Button>
                </div>

                <Row className="mb-3 gx-2 gy-2 align-items-center">
                    <Col xs="auto">
                        <ButtonGroup>
                            {[{ name: 'All', value: 'all' }, { name: 'Active', value: 'active' }, { name: 'Inactive', value: 'inactive' }].map((radio, idx) => (
                                <ToggleButton
                                    key={idx}
                                    id={`radio-status-${idx}`}
                                    type="radio"
                                    variant={filters.isActive === (radio.value === 'all' ? null : radio.value === 'active') ? 'primary' : 'outline-primary'}
                                    value={radio.value}
                                    checked={filters.isActive === (radio.value === 'all' ? null : radio.value === 'active')}
                                    onChange={(e) => handleStatusFilterChange(e.currentTarget.value)}
                                >
                                    {radio.name}
                                </ToggleButton>
                            ))}
                        </ButtonGroup>
                    </Col>

                    <Col xs="auto" className="me-auto"></Col>

                    <Col xs={12} md="auto" lg={4}>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="Filter by name..."
                            value={filters.name}
                            onChange={handleFilterChange}
                        />
                    </Col>

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
                        <th>Name</th>
                        <th>Status</th>
                        <th className="text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isTableLoading ? (
                        <tr><td colSpan="4" className="text-center p-4"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></td></tr>
                    ) : categories.length > 0 ? (
                        categories.map((category) => (
                            <tr key={category.id}>
                                <td data-label="ID">{category.id}</td>
                                <td data-label="Name">{category.name}</td>
                                <td data-label="Status">
                                        <span className={`badge ${category.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                </td>
                                <td className="text-center" data-label="Actions">
                                    {category.isActive ? (
                                        <>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={(e) => {
                                                    handleOpenEditModal(category)
                                                    e.currentTarget.blur();
                                                }}
                                            >Edit</Button>
                                            <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleOpenDeleteModal(category)}>Disable</Button>
                                        </>
                                    ) : (
                                        <Button variant="outline-success" size="sm" onClick={() => handleEnableCategory(category.id)}>Enable</Button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" className="text-center p-4">No categories found matching your criteria.</td></tr>
                    )}
                    </tbody>
                </Table>

                {totalPages > 1 && (
                    <nav><ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}><Button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</Button></li>
                        <li className="page-item disabled"><span className="page-link">Page {currentPage + 1} of {totalPages}</span></li>
                        <li className={`page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`}><Button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</Button></li>
                    </ul></nav>
                )}
            </Container>

            <CreateCategoryModal show={showCreateModal} onHide={() => setShowCreateModal(false)} onSave={handleCreateCategory} />
            <EditCategoryModal show={showEditModal} onHide={() => setShowEditModal(false)} category={selectedCategory} onSave={handleSaveChanges} />
            <DeleteConfirmationModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                itemType="category"
                itemName={categoryToDelete ? categoryToDelete.name : ''}
                actionText="disable"
                isPermanent={false}
            />
        </>
    );
}

export default CategoryList;