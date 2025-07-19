package com.aefstathiou.crm.user;

import lombok.*;

@Data
public class UserUpdateRequest {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
