package com.franchisehub.api.service;

import com.franchisehub.api.dto.AuthDto;
import com.franchisehub.api.entity.User;
import com.franchisehub.api.exception.BadRequestException;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.repository.UserRepository;
import com.franchisehub.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(loginRequest.getEmail());

        // Update last login time
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        AuthDto.UserDto userDto = mapToUserDto(user);

        return new AuthDto.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                86400L, // 24 hours
                userDto
        );
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        // Create new user
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setEmail(registerRequest.getEmail());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhone(registerRequest.getPhone());
        user.setCompany(registerRequest.getCompany());
        user.setRole(registerRequest.getRole());
        user.setLocation(registerRequest.getLocation());
        user.setWebsite(registerRequest.getWebsite());
        user.setBio(registerRequest.getBio());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setIsActive(true);

        // Set default preferences
        User.UserPreferences preferences = new User.UserPreferences();
        preferences.setNotifications(new User.UserPreferences.NotificationSettings());
        preferences.setTheme(User.UserPreferences.Theme.LIGHT);
        preferences.setLanguage("en");
        preferences.setTimezone("UTC");
        user.setPreferences(preferences);

        User savedUser = userRepository.save(user);

        // Generate tokens
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(registerRequest.getEmail());

        AuthDto.UserDto userDto = mapToUserDto(savedUser);

        return new AuthDto.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                86400L, // 24 hours
                userDto
        );
    }

    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();

        if (tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getUsernameFromToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            String newAccessToken = tokenProvider.generateTokenFromUsername(email);
            String newRefreshToken = tokenProvider.generateRefreshToken(email);

            AuthDto.UserDto userDto = mapToUserDto(user);

            return new AuthDto.AuthResponse(
                    newAccessToken,
                    newRefreshToken,
                    "Bearer",
                    86400L, // 24 hours
                    userDto
            );
        } else {
            throw new BadRequestException("Invalid refresh token");
        }
    }

    @Transactional
    public void changePassword(String email, AuthDto.ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    private AuthDto.UserDto mapToUserDto(User user) {
        AuthDto.UserDto userDto = new AuthDto.UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setRole(user.getRole());
        userDto.setPhone(user.getPhone());
        userDto.setCompany(user.getCompany());
        userDto.setAvatar(user.getAvatar());
        userDto.setBio(user.getBio());
        userDto.setLocation(user.getLocation());
        userDto.setWebsite(user.getWebsite());
        userDto.setIsActive(user.getIsActive());
        userDto.setLastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null);
        userDto.setPreferences(user.getPreferences());
        userDto.setCreatedAt(user.getCreatedAt().toString());
        userDto.setUpdatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null);
        return userDto;
    }
}
