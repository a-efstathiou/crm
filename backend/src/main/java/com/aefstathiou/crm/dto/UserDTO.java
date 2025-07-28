package com.aefstathiou.crm.dto;

import java.util.List;

public record UserDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        List<String> authorities
) {
}
