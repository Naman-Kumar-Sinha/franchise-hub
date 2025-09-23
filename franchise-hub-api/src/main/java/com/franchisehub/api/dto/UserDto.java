package com.franchisehub.api.dto;

import com.franchisehub.api.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

public class UserDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserProfileRequest {
        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must not exceed 50 characters")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must not exceed 50 characters")
        private String lastName;
        
        @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number format")
        private String phone;
        
        @Size(max = 100, message = "Company name must not exceed 100 characters")
        private String company;
        
        @Size(max = 100, message = "Location must not exceed 100 characters")
        private String location;
        
        @Pattern(regexp = "^(https?://)?(www\\.)?[a-zA-Z0-9-]+\\.[a-zA-Z]{2,}(/.*)?$", 
                message = "Invalid website URL format")
        private String website;
        
        @Size(max = 500, message = "Bio must not exceed 500 characters")
        private String bio;
        
        private String avatar;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserPreferencesRequest {
        private Boolean emailNotifications = true;
        private Boolean smsNotifications = false;
        private Boolean pushNotifications = true;
        private Boolean marketingEmails = false;
        
        @Pattern(regexp = "^(light|dark|auto)$", message = "Theme must be light, dark, or auto")
        private String theme = "light";
        
        @Pattern(regexp = "^[a-z]{2}(-[A-Z]{2})?$", message = "Invalid language format (e.g., en, en-US)")
        private String language = "en";
        
        @Pattern(regexp = "^[A-Za-z_]+/[A-Za-z_]+$", message = "Invalid timezone format")
        private String timezone = "UTC";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;
        
        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
                message = "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character")
        private String newPassword;
        
        @NotBlank(message = "Confirm password is required")
        private String confirmPassword;
        
        // Custom validation can be added in the controller to check if newPassword equals confirmPassword
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String company;
        private String location;
        private String website;
        private String bio;
        private String avatar;
        private User.UserRole role;
        private Boolean isActive;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private UserPreferencesResponse preferences;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private String id;
        private String email;
        private String firstName;
        private String lastName;
        private String company;
        private User.UserRole role;
        private Boolean isActive;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPreferencesResponse {
        private Boolean emailNotifications;
        private Boolean smsNotifications;
        private Boolean pushNotifications;
        private Boolean marketingEmails;
        private String theme;
        private String language;
        private String timezone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long activeUsers;
        private long inactiveUsers;
        private long businessUsers;
        private long partnerUsers;
        private long adminUsers;
        private long usersCreatedToday;
        private long usersCreatedThisWeek;
        private long usersCreatedThisMonth;
        private long usersLoggedInToday;
        private long usersLoggedInThisWeek;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        private String password;
        
        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must not exceed 50 characters")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must not exceed 50 characters")
        private String lastName;
        
        @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number format")
        private String phone;
        
        @NotNull(message = "User role is required")
        private User.UserRole role;
        
        private String company;
        private String location;
        private String website;
        private String bio;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRoleRequest {
        @NotNull(message = "Role is required")
        private User.UserRole role;
        
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserStatusRequest {
        @NotNull(message = "Active status is required")
        private Boolean isActive;
        
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSearchRequest {
        private String searchTerm;
        private User.UserRole role;
        private Boolean isActive;
        private LocalDateTime createdAfter;
        private LocalDateTime createdBefore;
        private LocalDateTime lastLoginAfter;
        private LocalDateTime lastLoginBefore;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserActivityResponse {
        private String userId;
        private String userEmail;
        private String userName;
        private String action;
        private String resource;
        private String resourceId;
        private LocalDateTime timestamp;
        private String ipAddress;
        private String userAgent;
    }
}
