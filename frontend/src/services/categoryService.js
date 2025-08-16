// src/services/categoryService.js

import api from './api';

// This new function handles pagination and filtering
const getAllCategoriesPaged = (page, size, filters) => {
    const params = {
        page,
        size,
        ...filters,
    };
    return api.get("/v1/categories", { params });
};

const createCategory = (categoryName) => {
    const requestData = { name: categoryName };
    return api.post("/v1/categories", requestData);
};

const updateCategory = (categoryId, categoryName) => {
    const requestData = { name: categoryName };
    return api.put(`/v1/categories/${categoryId}`, requestData);
};

const deleteCategory = (categoryId) => {
    return api.delete(`/v1/categories/${categoryId}`);
};

const enableCategory = (categoryid) => {
    return api.put(`/v1/categories/${categoryid}/enable`);
};

const categoryService = {
    getAllCategoriesPaged, // Use the new paged function
    createCategory,
    updateCategory,
    deleteCategory,
    enableCategory,
};

export default categoryService;