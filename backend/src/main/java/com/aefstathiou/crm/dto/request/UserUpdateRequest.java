package com.aefstathiou.crm.dto.request;

import lombok.*;

@Data
public class UserUpdateRequest {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}
