package com.aefstathiou.crm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank(message = "Category name cannot be blank")
        @Size(max = 100, message = "Category name cannot exceed 100 characters")
        String name
) {
}
