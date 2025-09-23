package com.franchisehub.api.controller;

import com.franchisehub.api.model.User;
import com.franchisehub.api.service.UserService;
import com.franchisehub.api.dto.UserDto;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.exception.BadRequestException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get all users", description = "Retrieve all users with pagination (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved users"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting all users with pagination: {}", pageable);
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<User> getUserById(
            @Parameter(description = "User ID") @PathVariable String id) {
        log.info("Getting user by ID: {}", id);
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get current user profile", description = "Retrieve the current user's profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user profile"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        log.info("Getting current user profile: {}", authentication.getName());
        User user = userService.getUserById(authentication.getName());
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Get users by role", description = "Retrieve users by role (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved users"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getUsersByRole(
            @Parameter(description = "User Role") @PathVariable User.UserRole role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting users by role: {} with pagination: {}", role, pageable);
        Page<User> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get active users", description = "Retrieve all active users (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved active users"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> getActiveUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting active users with pagination: {}", pageable);
        Page<User> users = userService.getActiveUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Get active users by role", description = "Retrieve active users by role (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved active users"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/active/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getActiveUsersByRole(
            @Parameter(description = "User Role") @PathVariable User.UserRole role) {
        log.info("Getting active users by role: {}", role);
        List<User> users = userService.getActiveUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Search users", description = "Search users by name or email (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved search results"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<User>> searchUsers(
            @Parameter(description = "Search term") @RequestParam String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching users with term: {} and pagination: {}", q, pageable);
        
        if (q == null || q.trim().isEmpty()) {
            throw new BadRequestException("Search term cannot be empty");
        }
        
        Page<User> users = userService.searchUsers(q.trim(), pageable);
        return ResponseEntity.ok(users);
    }

    @Operation(summary = "Update user profile", description = "Update user profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.name")
    public ResponseEntity<User> updateUserProfile(
            @Parameter(description = "User ID") @PathVariable String id,
            @Valid @RequestBody UserDto.UpdateUserProfileRequest request,
            Authentication authentication) {
        log.info("Updating user profile: {} by user: {}", id, authentication.getName());
        
        // Convert DTO to entity
        User userUpdate = mapToUser(request);
        
        User updatedUser = userService.updateUserProfile(id, userUpdate, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Update my profile", description = "Update current user's profile")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid user data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/me")
    public ResponseEntity<User> updateMyProfile(
            @Valid @RequestBody UserDto.UpdateUserProfileRequest request,
            Authentication authentication) {
        log.info("Updating profile for user: {}", authentication.getName());
        
        // Convert DTO to entity
        User userUpdate = mapToUser(request);
        
        User updatedUser = userService.updateUserProfile(authentication.getName(), userUpdate, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Update user preferences", description = "Update user preferences")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User preferences updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid preferences data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/{id}/preferences")
    @PreAuthorize("#id == authentication.name")
    public ResponseEntity<User> updateUserPreferences(
            @Parameter(description = "User ID") @PathVariable String id,
            @Valid @RequestBody UserDto.UpdateUserPreferencesRequest request,
            Authentication authentication) {
        log.info("Updating user preferences: {} by user: {}", id, authentication.getName());
        
        // Convert DTO to entity
        User.UserPreferences preferences = mapToUserPreferences(request);
        
        User updatedUser = userService.updateUserPreferences(id, preferences, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Update my preferences", description = "Update current user's preferences")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Preferences updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid preferences data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/me/preferences")
    public ResponseEntity<User> updateMyPreferences(
            @Valid @RequestBody UserDto.UpdateUserPreferencesRequest request,
            Authentication authentication) {
        log.info("Updating preferences for user: {}", authentication.getName());
        
        // Convert DTO to entity
        User.UserPreferences preferences = mapToUserPreferences(request);
        
        User updatedUser = userService.updateUserPreferences(authentication.getName(), preferences, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Change password", description = "Change user password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @PostMapping("/{id}/change-password")
    @PreAuthorize("#id == authentication.name")
    public ResponseEntity<Void> changePassword(
            @Parameter(description = "User ID") @PathVariable String id,
            @Valid @RequestBody UserDto.ChangePasswordRequest request,
            Authentication authentication) {
        log.info("Changing password for user: {} by user: {}", id, authentication.getName());
        
        userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword(), authentication.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Change my password", description = "Change current user's password")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid password data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changeMyPassword(
            @Valid @RequestBody UserDto.ChangePasswordRequest request,
            Authentication authentication) {
        log.info("Changing password for user: {}", authentication.getName());
        
        userService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword(), authentication.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update user role", description = "Update user role (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User role updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid role"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserRole(
            @Parameter(description = "User ID") @PathVariable String id,
            @Parameter(description = "New role") @RequestParam User.UserRole role,
            Authentication authentication) {
        log.info("Updating user role: {} to {} by admin: {}", id, role, authentication.getName());
        
        User updatedUser = userService.updateUserRole(id, role, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Update user status", description = "Activate/Deactivate user (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserStatus(
            @Parameter(description = "User ID") @PathVariable String id,
            @Parameter(description = "Active status") @RequestParam boolean isActive,
            Authentication authentication) {
        log.info("Updating user status: {} to {} by admin: {}", id, isActive ? "active" : "inactive", authentication.getName());
        
        User updatedUser = userService.updateUserStatus(id, isActive, authentication.getName());
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "Delete user", description = "Delete user (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "User deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "User ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Deleting user: {} by admin: {}", id, authentication.getName());
        
        userService.deleteUser(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get user statistics", description = "Get user statistics (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserService.UserStats> getUserStats() {
        log.info("Getting user statistics");
        UserService.UserStats stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get recent users", description = "Get recently created users (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved recent users"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getRecentUsers() {
        log.info("Getting recent users");
        List<User> users = userService.getRecentUsers();
        return ResponseEntity.ok(users);
    }

    // Helper methods for DTO mapping
    private User mapToUser(UserDto.UpdateUserProfileRequest request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setCompany(request.getCompany());
        user.setLocation(request.getLocation());
        user.setWebsite(request.getWebsite());
        user.setBio(request.getBio());
        user.setAvatar(request.getAvatar());
        return user;
    }

    private User.UserPreferences mapToUserPreferences(UserDto.UpdateUserPreferencesRequest request) {
        User.UserPreferences preferences = new User.UserPreferences();

        // Set notification settings
        User.UserPreferences.NotificationSettings notifications = new User.UserPreferences.NotificationSettings();
        notifications.setEmail(request.getEmailNotifications());
        notifications.setSms(request.getSmsNotifications());
        notifications.setPush(request.getPushNotifications());
        preferences.setNotifications(notifications);

        // Set theme (convert string to enum)
        if (request.getTheme() != null) {
            try {
                User.UserPreferences.Theme theme = User.UserPreferences.Theme.valueOf(request.getTheme().toUpperCase());
                preferences.setTheme(theme);
            } catch (IllegalArgumentException e) {
                preferences.setTheme(User.UserPreferences.Theme.LIGHT); // default
            }
        }

        preferences.setLanguage(request.getLanguage());
        preferences.setTimezone(request.getTimezone());
        return preferences;
    }
}
