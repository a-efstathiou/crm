package com.aefstathiou.crm.mapper;

import com.aefstathiou.crm.dto.CategoryDTO;
import com.aefstathiou.crm.model.Category;
import org.springframework.stereotype.Service;

import java.util.function.Function;

@Service
public class CategoryDTOMapper implements Function<Category, CategoryDTO> {
    @Override
    public CategoryDTO apply(Category category) {
        return new CategoryDTO(
                category.getId(),
                category.getName(),
                category.isActive()
        );
    }
}
