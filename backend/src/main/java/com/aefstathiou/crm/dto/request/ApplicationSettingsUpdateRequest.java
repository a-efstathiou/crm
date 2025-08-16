package com.aefstathiou.crm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplicationSettingsUpdateRequest(
        @NotBlank(message = "Application name cannot be blank")
        @Size(max = 50, message = "Application name cannot exceed 50 characters")
        String appName
) { }
