package com.aefstathiou.crm.service;

import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.specification.CategorySpecification;
import com.aefstathiou.crm.specification.UserSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.aefstathiou.crm.dto.CategoryDTO;
import com.aefstathiou.crm.dto.request.CategoryRequest;
import com.aefstathiou.crm.mapper.CategoryDTOMapper;
import com.aefstathiou.crm.model.Category;
import com.aefstathiou.crm.repository.CategoryRepository;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryDTOMapper categoryDTOMapper;

    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        categoryRepository.findByNameIgnoreCase(request.name()).ifPresent(c -> {
            throw new EntityExistsException("A category with this name already exists.");
        });

        Category newCategory = new Category();
        newCategory.setName(request.name());
        newCategory.setActive(true);

        Category savedCategory = categoryRepository.save(newCategory);
        return categoryDTOMapper.apply(savedCategory);
    }

    public Page<CategoryDTO> getAllCategories(Pageable pageable, String name, Boolean isActive) {
        Specification<Category> spec = (root, query, builder) -> null;

        Specification<Category> nameSpec = CategorySpecification.nameContains(name);
        Specification<Category> isActiveSpec = CategorySpecification.isActive(isActive);

        if (nameSpec != null) spec = nameSpec;
        if (isActiveSpec != null) spec = (spec != null) ? spec.and(isActiveSpec) : isActiveSpec;

        return categoryRepository.findAll(spec, pageable).map(categoryDTOMapper);
    }


    public List<CategoryDTO> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(categoryDTOMapper)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO updateCategory(Long categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + categoryId));

        category.setName(request.name());
        Category updatedCategory = categoryRepository.save(category);
        return categoryDTOMapper.apply(updatedCategory);
    }

    @Transactional
    public void softDeleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + categoryId));

        category.setActive(false);
        categoryRepository.save(category);
    }

    @Transactional
    public CategoryDTO enableCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + categoryId));

        category.setActive(true);
        Category updatedCategory = categoryRepository.save(category);
        return categoryDTOMapper.apply(updatedCategory);
    }
}
