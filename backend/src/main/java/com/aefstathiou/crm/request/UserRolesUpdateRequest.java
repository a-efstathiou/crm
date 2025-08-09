package com.aefstathiou.crm.request;

import com.aefstathiou.crm.enums.Role;
import lombok.Data;
import java.util.List;

@Data
public class UserRolesUpdateRequest {
    private List<Role> roles;
}
