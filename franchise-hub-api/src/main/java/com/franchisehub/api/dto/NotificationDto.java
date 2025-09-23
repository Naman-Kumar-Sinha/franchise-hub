package com.franchisehub.api.dto;

import com.franchisehub.api.model.Notification;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNotificationRequest {
        @NotBlank(message = "User ID is required")
        private String userId;
        
        @NotNull(message = "Notification type is required")
        private Notification.NotificationType type;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
        
        private Notification.NotificationPriority priority = Notification.NotificationPriority.MEDIUM;
        
        private String applicationId;
        private String franchiseId;
        private String paymentRequestId;
        private String actionText;
        private String actionUrl;
        private LocalDateTime expiresAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateApplicationUpdateNotificationRequest {
        @NotBlank(message = "User ID is required")
        private String userId;
        
        @NotBlank(message = "Application ID is required")
        private String applicationId;
        
        @NotBlank(message = "Franchise ID is required")
        private String franchiseId;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentRequestNotificationRequest {
        @NotBlank(message = "User ID is required")
        private String userId;
        
        @NotBlank(message = "Payment request ID is required")
        private String paymentRequestId;
        
        @NotBlank(message = "Franchise ID is required")
        private String franchiseId;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSystemAlertNotificationRequest {
        @NotBlank(message = "User ID is required")
        private String userId;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
        
        @NotNull(message = "Priority is required")
        private Notification.NotificationPriority priority;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private String id;
        private String userId;
        private Notification.NotificationType type;
        private Notification.NotificationStatus status;
        private Notification.NotificationPriority priority;
        private String title;
        private String message;
        private String applicationId;
        private String franchiseId;
        private String paymentRequestId;
        private String actionText;
        private String actionUrl;
        private LocalDateTime readAt;
        private LocalDateTime expiresAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationSummary {
        private String id;
        private Notification.NotificationType type;
        private Notification.NotificationStatus status;
        private Notification.NotificationPriority priority;
        private String title;
        private String message;
        private String actionText;
        private LocalDateTime createdAt;
        private Boolean isExpired;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationStats {
        private long totalNotifications;
        private long unreadNotifications;
        private long readNotifications;
        private long expiredNotifications;
        private long highPriorityNotifications;
        private long mediumPriorityNotifications;
        private long lowPriorityNotifications;
        private long applicationUpdateNotifications;
        private long paymentRequestNotifications;
        private long partnershipUpdateNotifications;
        private long systemAlertNotifications;
        private long documentRequiredNotifications;
        private long approvalNotifications;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationPreferences {
        private Boolean emailNotifications = true;
        private Boolean smsNotifications = false;
        private Boolean pushNotifications = true;
        private Boolean applicationUpdates = true;
        private Boolean paymentRequests = true;
        private Boolean partnershipUpdates = true;
        private Boolean systemAlerts = true;
        private Boolean documentRequests = true;
        private Boolean approvalNotifications = true;
        private Boolean marketingNotifications = false;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkNotificationRequest {
        @NotEmpty(message = "User IDs list cannot be empty")
        private java.util.List<String> userIds;
        
        @NotNull(message = "Notification type is required")
        private Notification.NotificationType type;
        
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
        
        private Notification.NotificationPriority priority = Notification.NotificationPriority.MEDIUM;
        
        private String actionText;
        private String actionUrl;
        private LocalDateTime expiresAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkAsReadRequest {
        @NotEmpty(message = "Notification IDs list cannot be empty")
        private java.util.List<String> notificationIds;
    }
}
