package com.aefstathiou.crm.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record UserChangePasswordRequest(
        @NotEmpty(message = "Current password cannot be empty")
        String currentPassword,
        @NotEmpty(message = "New password cannot be empty")
        @Size(min = 8, message = "New password must be at least 8 characters long")
        String newPassword
) { }
