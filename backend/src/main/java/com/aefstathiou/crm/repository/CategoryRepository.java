package com.aefstathiou.crm.repository;

import com.aefstathiou.crm.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    List<Category> findByIsActiveTrue();

    Optional<Object> findByNameIgnoreCase(String name);
}
