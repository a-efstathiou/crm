package com.aefstathiou.crm.specification;

import com.aefstathiou.crm.model.Category;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class CategorySpecification {

    public static Specification<Category> nameContains(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Category> isActive(Boolean active) {
        if (active == null) {
            return null;
        }
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("isActive"), active);
    }
}
