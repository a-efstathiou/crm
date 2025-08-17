import api from './api';

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

const enableCategory = (categoryId) => {
    return api.put(`/v1/categories/${categoryId}/enable`);
};

const getActiveCategories = () => {
    return api.get("/v1/categories/active");
};

const categoryService = {
    getAllCategoriesPaged, // Use the new paged function
    createCategory,
    updateCategory,
    deleteCategory,
    enableCategory,
    getActiveCategories,
};

export default categoryService;