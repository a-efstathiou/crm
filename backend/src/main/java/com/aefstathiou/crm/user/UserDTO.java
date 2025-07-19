package com.aefstathiou.crm.user;

import com.aefstathiou.crm.enums.Role;

import java.util.List;

public record UserDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        List<String> authorities
) {
}
