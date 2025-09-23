package com.franchisehub.api.controller;

import com.franchisehub.api.dto.AuthDto;
import com.franchisehub.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest loginRequest) {
        AuthDto.AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Registration successful"),
        @ApiResponse(responseCode = "400", description = "Invalid request data or email already exists")
    })
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest registerRequest) {
        AuthDto.AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refresh successful"),
        @ApiResponse(responseCode = "400", description = "Invalid refresh token")
    })
    public ResponseEntity<AuthDto.AuthResponse> refreshToken(@Valid @RequestBody AuthDto.RefreshTokenRequest refreshTokenRequest) {
        AuthDto.AuthResponse response = authService.refreshToken(refreshTokenRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user (client should discard tokens)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<String> logout() {
        // In a stateless JWT implementation, logout is handled client-side
        // by discarding the tokens. Server-side logout would require token blacklisting.
        return ResponseEntity.ok("Logout successful");
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid current password or request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody AuthDto.ChangePasswordRequest changePasswordRequest,
            Authentication authentication) {
        
        String email = authentication.getName();
        authService.changePassword(email, changePasswordRequest);
        return ResponseEntity.ok("Password changed successfully");
    }
}
