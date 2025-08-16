package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest (
        @NotBlank(message = "First name cannot be blank")
        @Size(max = 50)
        String firstName,
        @NotBlank(message = "Last name cannot be blank")
        @Size(max = 50)
        String lastName,
        @NotNull(message = "Role cannot be null")
        Role role
) {}
