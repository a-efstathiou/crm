package com.aefstathiou.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplicationSettingsDTO(
        @NotBlank
        @Size(max = 50)
        String appName
) { }