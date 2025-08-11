package com.aefstathiou.crm.controller;

import com.aefstathiou.crm.request.AuthenticationRequest;
import com.aefstathiou.crm.response.AuthenticationResponse;
import com.aefstathiou.crm.service.AuthenticationService;
import com.aefstathiou.crm.service.JwtService;
import com.aefstathiou.crm.request.RegisterRequest;
import com.aefstathiou.crm.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader
    ) {
        return ResponseEntity.ok(authenticationService.refreshToken(authHeader));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

}