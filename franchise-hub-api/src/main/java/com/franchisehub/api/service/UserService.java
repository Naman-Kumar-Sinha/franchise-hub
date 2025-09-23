package com.franchisehub.api.service;

import com.franchisehub.api.model.User;
import com.franchisehub.api.repository.UserRepository;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get all users with pagination
     */
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        log.debug("Getting all users with pagination: {}", pageable);
        return userRepository.findAll(pageable);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public User getUserById(String id) {
        log.debug("Getting user by ID: {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        log.debug("Getting user by email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(User.UserRole role) {
        log.debug("Getting users by role: {}", role);
        return userRepository.findByRole(role);
    }

    /**
     * Get users by role with pagination
     */
    @Transactional(readOnly = true)
    public Page<User> getUsersByRole(User.UserRole role, Pageable pageable) {
        log.debug("Getting users by role: {} with pagination: {}", role, pageable);
        return userRepository.findByRole(role, pageable);
    }

    /**
     * Get active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        log.debug("Getting active users");
        return userRepository.findByIsActiveTrue();
    }

    /**
     * Get active users with pagination
     */
    @Transactional(readOnly = true)
    public Page<User> getActiveUsers(Pageable pageable) {
        log.debug("Getting active users with pagination: {}", pageable);
        return userRepository.findByIsActiveTrue(pageable);
    }

    /**
     * Get active users by role
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsersByRole(User.UserRole role) {
        log.debug("Getting active users by role: {}", role);
        return userRepository.findActiveUsersByRole(role);
    }

    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String searchTerm, Pageable pageable) {
        log.debug("Searching users with term: {} and pagination: {}", searchTerm, pageable);
        return userRepository.searchUsers(searchTerm, pageable);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(String id, User userUpdate, String currentUserId) {
        log.debug("Updating user profile: {} by user: {}", id, currentUserId);
        
        User existingUser = getUserById(id);
        
        // Verify permission (users can only update their own profile, or admin can update any)
        User currentUser = getUserById(currentUserId);
        if (!id.equals(currentUserId) && currentUser.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("You can only update your own profile");
        }

        // Update allowed fields
        existingUser.setFirstName(userUpdate.getFirstName());
        existingUser.setLastName(userUpdate.getLastName());
        existingUser.setPhone(userUpdate.getPhone());
        existingUser.setCompany(userUpdate.getCompany());
        existingUser.setLocation(userUpdate.getLocation());
        existingUser.setWebsite(userUpdate.getWebsite());
        existingUser.setBio(userUpdate.getBio());
        existingUser.setAvatar(userUpdate.getAvatar());
        existingUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(existingUser);
        log.info("Updated user profile with ID: {}", savedUser.getId());
        return savedUser;
    }

    /**
     * Update user preferences
     */
    public User updateUserPreferences(String id, User.UserPreferences preferences, String currentUserId) {
        log.debug("Updating user preferences: {} by user: {}", id, currentUserId);
        
        User existingUser = getUserById(id);
        
        // Verify permission (users can only update their own preferences)
        if (!id.equals(currentUserId)) {
            throw new BadRequestException("You can only update your own preferences");
        }

        // Update preferences
        existingUser.setPreferences(preferences);
        existingUser.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(existingUser);
        log.info("Updated user preferences with ID: {}", savedUser.getId());
        return savedUser;
    }

    /**
     * Change user password
     */
    public void changePassword(String id, String currentPassword, String newPassword, String currentUserId) {
        log.debug("Changing password for user: {} by user: {}", id, currentUserId);
        
        User user = getUserById(id);
        
        // Verify permission (users can only change their own password)
        if (!id.equals(currentUserId)) {
            throw new BadRequestException("You can only change your own password");
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Validate new password
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters long");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("Changed password for user with ID: {}", id);
    }

    /**
     * Update user role (admin only)
     */
    public User updateUserRole(String id, User.UserRole newRole, String adminUserId) {
        log.debug("Updating user role: {} to {} by admin: {}", id, newRole, adminUserId);
        
        User admin = getUserById(adminUserId);
        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("Only administrators can update user roles");
        }

        User user = getUserById(id);
        
        // Prevent admin from changing their own role
        if (id.equals(adminUserId)) {
            throw new BadRequestException("You cannot change your own role");
        }

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Updated user role for ID: {} to {}", id, newRole);
        return savedUser;
    }

    /**
     * Activate/Deactivate user (admin only)
     */
    public User updateUserStatus(String id, boolean isActive, String adminUserId) {
        log.debug("Updating user status: {} to {} by admin: {}", id, isActive, adminUserId);
        
        User admin = getUserById(adminUserId);
        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("Only administrators can update user status");
        }

        User user = getUserById(id);
        
        // Prevent admin from deactivating themselves
        if (id.equals(adminUserId) && !isActive) {
            throw new BadRequestException("You cannot deactivate your own account");
        }

        user.setIsActive(isActive);
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Updated user status for ID: {} to {}", id, isActive ? "active" : "inactive");
        return savedUser;
    }

    /**
     * Delete user (admin only)
     */
    public void deleteUser(String id, String adminUserId) {
        log.debug("Deleting user: {} by admin: {}", id, adminUserId);
        
        User admin = getUserById(adminUserId);
        if (admin.getRole() != User.UserRole.ADMIN) {
            throw new BadRequestException("Only administrators can delete users");
        }

        User user = getUserById(id);
        
        // Prevent admin from deleting themselves
        if (id.equals(adminUserId)) {
            throw new BadRequestException("You cannot delete your own account");
        }

        // Soft delete by deactivating the user
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("Soft deleted user with ID: {}", id);
    }

    /**
     * Update last login time
     */
    public void updateLastLoginTime(String id) {
        log.debug("Updating last login time for user: {}", id);
        
        User user = getUserById(id);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Check if email exists
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        log.debug("Checking if email exists: {}", email);
        return userRepository.existsByEmail(email);
    }

    /**
     * Get users logged in since a specific time
     */
    @Transactional(readOnly = true)
    public List<User> getUsersLoggedInSince(LocalDateTime since) {
        log.debug("Getting users logged in since: {}", since);
        return userRepository.findUsersLoggedInSince(since);
    }

    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStats getUserStats() {
        log.debug("Getting user statistics");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findByIsActiveTrue().size();
        long businessUsers = userRepository.countActiveUsersByRole(User.UserRole.BUSINESS);
        long partnerUsers = userRepository.countActiveUsersByRole(User.UserRole.PARTNER);
        long adminUsers = userRepository.countActiveUsersByRole(User.UserRole.ADMIN);
        
        return new UserStats(totalUsers, activeUsers, businessUsers, partnerUsers, adminUsers);
    }

    /**
     * Get users created since a specific time
     */
    @Transactional(readOnly = true)
    public long getUsersCreatedSince(LocalDateTime since) {
        log.debug("Getting users created since: {}", since);
        return userRepository.countUsersCreatedSince(since);
    }

    /**
     * Get recent users (created in last 30 days)
     */
    @Transactional(readOnly = true)
    public List<User> getRecentUsers() {
        log.debug("Getting recent users");
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return userRepository.findUsersLoggedInSince(thirtyDaysAgo);
    }

    /**
     * Validate user permissions for resource access
     */
    @Transactional(readOnly = true)
    public boolean hasPermissionToAccessResource(String userId, String resourceOwnerId, User.UserRole requiredRole) {
        log.debug("Checking permissions for user: {} to access resource owned by: {}", userId, resourceOwnerId);
        
        User user = getUserById(userId);
        
        // Admin can access everything
        if (user.getRole() == User.UserRole.ADMIN) {
            return true;
        }
        
        // User can access their own resources
        if (userId.equals(resourceOwnerId)) {
            return true;
        }
        
        // Check if user has required role
        if (requiredRole != null && user.getRole() == requiredRole) {
            return true;
        }
        
        return false;
    }

    /**
     * Inner class for user statistics
     */
    public static class UserStats {
        private final long total;
        private final long active;
        private final long business;
        private final long partner;
        private final long admin;

        public UserStats(long total, long active, long business, long partner, long admin) {
            this.total = total;
            this.active = active;
            this.business = business;
            this.partner = partner;
            this.admin = admin;
        }

        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getInactive() { return total - active; }
        public long getBusiness() { return business; }
        public long getPartner() { return partner; }
        public long getAdmin() { return admin; }
    }
}
