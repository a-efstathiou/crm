package com.aefstathiou.crm.service;

import com.aefstathiou.crm.enums.Role;
import com.aefstathiou.crm.exception.UnauthorizedException;
import com.aefstathiou.crm.response.AuthenticationResponse;
import com.aefstathiou.crm.enums.TokenType;
import com.aefstathiou.crm.model.JwtToken;
import com.aefstathiou.crm.repository.JwtTokenRepository;
import com.aefstathiou.crm.model.User;
import com.aefstathiou.crm.repository.UserRepository;
import com.aefstathiou.crm.request.AuthenticationRequest;
import com.aefstathiou.crm.request.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final JwtTokenRepository jwtTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllValidAccessTokens(user);
        saveUserToken(user, jwtToken);
        saveRefreshToken(user, refreshToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public void saveUserToken(User user, String jwtToken) {
        var token = JwtToken.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.ACCESS)
                .expired(false)
                .revoked(false)
                .build();
        jwtTokenRepository.save(token);
    }

    public void saveRefreshToken(User user, String refreshToken) {
        var token = JwtToken.builder()
                .user(user)
                .token(refreshToken)
                .tokenType(TokenType.REFRESH)
                .expired(false)
                .revoked(false)
                .build();
        jwtTokenRepository.save(token);
    }

    public void revokeAllValidAccessTokens(User user) {
        var validUserTokens = jwtTokenRepository.findAllValidAccessTokensByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        jwtTokenRepository.saveAll(validUserTokens);
    }

    public void revokeRefreshToken(String oldRefreshToken) {
        jwtTokenRepository.findRefreshToken(oldRefreshToken).ifPresent(t -> {
            t.setExpired(true);
            t.setRevoked(true);
            jwtTokenRepository.save(t);
        });
    }

    public AuthenticationResponse refreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("The header doesn't start with \"Bearer \"");
        }

        final String refreshToken = authHeader.substring(7);
        final String userEmail;

        try {
            userEmail = jwtService.extractUsername(refreshToken);
        } catch (JwtException e) {
            throw new UnauthorizedException(e.getMessage());
        }
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + userEmail));

        if (!jwtService.isRefreshToken(refreshToken) || !jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        var newAccess = jwtService.generateAccessToken(user);
        var newRefresh = jwtService.generateRefreshToken(user);

        revokeAllValidAccessTokens(user);
        revokeRefreshToken(refreshToken);
        saveUserToken(user, newAccess);
        saveRefreshToken(user, newRefresh);

        return AuthenticationResponse.builder()
                .accessToken(newAccess)
                .refreshToken(newRefresh)
                .build();
    }
}