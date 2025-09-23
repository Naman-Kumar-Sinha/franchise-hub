package com.franchisehub.api.controller;

import com.franchisehub.api.model.Notification;
import com.franchisehub.api.service.NotificationService;
import com.franchisehub.api.dto.NotificationDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get all notifications", description = "Retrieve all notifications (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getAllNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting all notifications with pagination: {}", pageable);
        Page<Notification> notifications = notificationService.getAllNotifications(pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notification by ID", description = "Retrieve a specific notification by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notification"),
        @ApiResponse(responseCode = "404", description = "Notification not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @notificationService.isNotificationOwner(#id, authentication.name)")
    public ResponseEntity<Notification> getNotificationById(
            @Parameter(description = "Notification ID") @PathVariable String id) {
        log.info("Getting notification by ID: {}", id);
        Notification notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }

    @Operation(summary = "Get notifications by user", description = "Retrieve notifications for a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<Page<Notification>> getNotificationsByUser(
            @Parameter(description = "User ID") @PathVariable String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting notifications by user: {} with pagination: {}", userId, pageable);
        Page<Notification> notifications = notificationService.getNotificationsByUserId(userId, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get my notifications", description = "Retrieve notifications for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<Page<Notification>> getMyNotifications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting notifications for user: {} with pagination: {}", authentication.getName(), pageable);
        Page<Notification> notifications = notificationService.getNotificationsByUserId(authentication.getName(), pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get unread notifications", description = "Retrieve unread notifications for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved unread notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        log.info("Getting unread notifications for user: {}", authentication.getName());
        List<Notification> notifications = notificationService.getUnreadNotificationsByUserId(authentication.getName());
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notifications by status", description = "Retrieve notifications by status for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me/status/{status}")
    public ResponseEntity<Page<Notification>> getNotificationsByStatus(
            @Parameter(description = "Notification Status") @PathVariable Notification.NotificationStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting notifications by status: {} for user: {} with pagination: {}", status, authentication.getName(), pageable);
        Page<Notification> notifications = notificationService.getNotificationsByUserIdAndStatus(authentication.getName(), status, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notifications by type", description = "Retrieve notifications by type (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getNotificationsByType(
            @Parameter(description = "Notification Type") @PathVariable Notification.NotificationType type,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting notifications by type: {} with pagination: {}", type, pageable);
        Page<Notification> notifications = notificationService.getNotificationsByType(type, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Get notifications by priority", description = "Retrieve notifications by priority (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Notification>> getNotificationsByPriority(
            @Parameter(description = "Notification Priority") @PathVariable Notification.NotificationPriority priority,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting notifications by priority: {} with pagination: {}", priority, pageable);
        Page<Notification> notifications = notificationService.getNotificationsByPriority(priority, pageable);
        return ResponseEntity.ok(notifications);
    }

    @Operation(summary = "Create notification", description = "Create a new notification (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid notification data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createNotification(
            @Valid @RequestBody NotificationDto.CreateNotificationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());
        
        // Convert DTO to entity
        Notification notification = mapToNotification(request);
        
        Notification createdNotification = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    @Operation(summary = "Create application update notification", description = "Create an application update notification (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid notification data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/application-update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createApplicationUpdateNotification(
            @Valid @RequestBody NotificationDto.CreateApplicationUpdateNotificationRequest request) {
        log.info("Creating application update notification for user: {}", request.getUserId());
        
        Notification notification = notificationService.createApplicationUpdateNotification(
                request.getUserId(), request.getApplicationId(), request.getFranchiseId(), 
                request.getTitle(), request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @Operation(summary = "Create payment request notification", description = "Create a payment request notification (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid notification data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/payment-request")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createPaymentRequestNotification(
            @Valid @RequestBody NotificationDto.CreatePaymentRequestNotificationRequest request) {
        log.info("Creating payment request notification for user: {}", request.getUserId());
        
        Notification notification = notificationService.createPaymentRequestNotification(
                request.getUserId(), request.getPaymentRequestId(), request.getFranchiseId(), 
                request.getTitle(), request.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @Operation(summary = "Create system alert notification", description = "Create a system alert notification (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notification created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid notification data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/system-alert")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> createSystemAlertNotification(
            @Valid @RequestBody NotificationDto.CreateSystemAlertNotificationRequest request) {
        log.info("Creating system alert notification for user: {}", request.getUserId());
        
        Notification notification = notificationService.createSystemAlertNotification(
                request.getUserId(), request.getTitle(), request.getMessage(), request.getPriority());
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @Operation(summary = "Mark notification as read", description = "Mark a notification as read")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notification marked as read successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @PostMapping("/{id}/read")
    @PreAuthorize("@notificationService.isNotificationOwner(#id, authentication.name)")
    public ResponseEntity<Notification> markAsRead(
            @Parameter(description = "Notification ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Marking notification as read: {} by user: {}", id, authentication.getName());
        
        Notification notification = notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(notification);
    }

    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "All notifications marked as read successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/me/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        log.info("Marking all notifications as read for user: {}", authentication.getName());
        
        notificationService.markAllAsReadForUser(authentication.getName());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Delete notification", description = "Delete a notification")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Notification deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("@notificationService.isNotificationOwner(#id, authentication.name)")
    public ResponseEntity<Void> deleteNotification(
            @Parameter(description = "Notification ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Deleting notification: {} by user: {}", id, authentication.getName());
        
        notificationService.deleteNotification(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete all read notifications", description = "Delete all read notifications for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "All read notifications deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/me/read")
    public ResponseEntity<Void> deleteAllReadNotifications(Authentication authentication) {
        log.info("Deleting all read notifications for user: {}", authentication.getName());
        
        notificationService.deleteAllReadNotificationsForUser(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get unread notification count", description = "Get count of unread notifications for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved unread count"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me/unread/count")
    public ResponseEntity<Long> getUnreadNotificationCount(Authentication authentication) {
        log.info("Getting unread notification count for user: {}", authentication.getName());
        
        long count = notificationService.getUnreadNotificationCount(authentication.getName());
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "Get notification statistics", description = "Get notification statistics (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationService.NotificationStats> getNotificationStats() {
        log.info("Getting notification statistics");
        NotificationService.NotificationStats stats = notificationService.getNotificationStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get my notification statistics", description = "Get notification statistics for the current user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me/stats")
    public ResponseEntity<NotificationService.NotificationStats> getMyNotificationStats(Authentication authentication) {
        log.info("Getting notification statistics for user: {}", authentication.getName());
        NotificationService.NotificationStats stats = notificationService.getNotificationStatsByUser(authentication.getName());
        return ResponseEntity.ok(stats);
    }

    // Helper methods for DTO mapping
    private Notification mapToNotification(NotificationDto.CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setUserId(request.getUserId());
        notification.setType(request.getType());
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setPriority(request.getPriority());
        notification.setApplicationId(request.getApplicationId());
        notification.setFranchiseId(request.getFranchiseId());
        notification.setPaymentRequestId(request.getPaymentRequestId());
        notification.setActionText(request.getActionText());
        notification.setActionUrl(request.getActionUrl());
        notification.setExpiresAt(request.getExpiresAt());
        return notification;
    }
}
