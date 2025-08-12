package com.aefstathiou.crm.dto.request;

import com.aefstathiou.crm.enums.Role;
import lombok.Data;

@Data
public class UserRolesUpdateRequest {
    private Role role;
}
