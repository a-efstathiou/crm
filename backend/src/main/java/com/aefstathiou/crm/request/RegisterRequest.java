package com.aefstathiou.crm.request;

import com.aefstathiou.crm.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String password;
    private String email;
    private List<Role> roles;
}
