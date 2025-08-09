package com.aefstathiou.crm.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.configurationprocessor.json.JSONObject;

@Getter
@Setter
public class ApiError {

    private String errorCode;
    private String errorMessage;

    public ApiError(String code, String message) {
        this.errorCode = code;
        this.errorMessage = message;
    }
}
