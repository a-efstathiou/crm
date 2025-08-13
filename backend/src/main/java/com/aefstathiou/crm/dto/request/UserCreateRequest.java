package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserCreateRequest {
    private String firstName;
    private String lastName;
    private String password;
    private String email;
    private Role role;
}
