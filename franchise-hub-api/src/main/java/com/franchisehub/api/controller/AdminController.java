package com.franchisehub.api.controller;

import com.franchisehub.api.service.UserService;
import com.franchisehub.api.service.FranchiseService;
import com.franchisehub.api.service.ApplicationService;
import com.franchisehub.api.service.PaymentService;
import com.franchisehub.api.service.NotificationService;
import com.franchisehub.api.dto.AdminDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "APIs for administrative operations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final FranchiseService franchiseService;
    private final ApplicationService applicationService;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Operation(summary = "Get dashboard statistics", description = "Get comprehensive dashboard statistics for admin")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDto.DashboardStats> getDashboardStats() {
        log.info("Getting admin dashboard statistics");
        
        // Collect statistics from all services
        UserService.UserStats userStats = userService.getUserStats();
        FranchiseService.FranchiseStats franchiseStats = franchiseService.getFranchiseStats();
        ApplicationService.ApplicationStats applicationStats = applicationService.getApplicationStats();
        PaymentService.PaymentStats paymentStats = paymentService.getPaymentStats();
        NotificationService.NotificationStats notificationStats = notificationService.getNotificationStats();
        
        // Create comprehensive dashboard stats
        AdminDto.DashboardStats dashboardStats = new AdminDto.DashboardStats(
                userStats, franchiseStats, applicationStats, paymentStats, notificationStats);
        
        return ResponseEntity.ok(dashboardStats);
    }

    @Operation(summary = "Get user statistics", description = "Get detailed user statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/users")
    public ResponseEntity<UserService.UserStats> getUserStats() {
        log.info("Getting user statistics for admin");
        UserService.UserStats stats = userService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get franchise statistics", description = "Get detailed franchise statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchise statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/franchises")
    public ResponseEntity<FranchiseService.FranchiseStats> getFranchiseStats() {
        log.info("Getting franchise statistics for admin");
        FranchiseService.FranchiseStats stats = franchiseService.getFranchiseStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get application statistics", description = "Get detailed application statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved application statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/applications")
    public ResponseEntity<ApplicationService.ApplicationStats> getApplicationStats() {
        log.info("Getting application statistics for admin");
        ApplicationService.ApplicationStats stats = applicationService.getApplicationStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get payment statistics", description = "Get detailed payment statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/payments")
    public ResponseEntity<PaymentService.PaymentStats> getPaymentStats() {
        log.info("Getting payment statistics for admin");
        PaymentService.PaymentStats stats = paymentService.getPaymentStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get notification statistics", description = "Get detailed notification statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved notification statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/notifications")
    public ResponseEntity<NotificationService.NotificationStats> getNotificationStats() {
        log.info("Getting notification statistics for admin");
        NotificationService.NotificationStats stats = notificationService.getNotificationStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get growth statistics", description = "Get growth statistics for the last 30 days")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved growth statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats/growth")
    public ResponseEntity<AdminDto.GrowthStats> getGrowthStats() {
        log.info("Getting growth statistics for admin");
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        
        // Get growth metrics
        long newUsersLast30Days = userService.getUsersCreatedSince(thirtyDaysAgo);
        long newFranchisesLast30Days = franchiseService.getFranchisesCreatedSince(thirtyDaysAgo).size();
        long newApplicationsLast30Days = applicationService.getApplicationsCreatedSince(thirtyDaysAgo).size();
        
        AdminDto.GrowthStats growthStats = new AdminDto.GrowthStats(
                newUsersLast30Days, newFranchisesLast30Days, newApplicationsLast30Days);
        
        return ResponseEntity.ok(growthStats);
    }

    @Operation(summary = "Get system health", description = "Get system health status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved system health"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/health")
    public ResponseEntity<AdminDto.SystemHealth> getSystemHealth() {
        log.info("Getting system health for admin");
        
        // Basic health checks
        boolean databaseHealthy = true; // Could implement actual database health check
        boolean servicesHealthy = true; // Could implement service health checks
        long uptime = System.currentTimeMillis(); // Simplified uptime
        
        AdminDto.SystemHealth systemHealth = new AdminDto.SystemHealth(
                databaseHealthy, servicesHealthy, uptime, LocalDateTime.now());
        
        return ResponseEntity.ok(systemHealth);
    }

    @Operation(summary = "Cleanup expired notifications", description = "Clean up expired notifications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully cleaned up expired notifications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/cleanup/notifications")
    public ResponseEntity<Void> cleanupExpiredNotifications() {
        log.info("Cleaning up expired notifications");
        notificationService.cleanupExpiredNotifications();
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get recent activity", description = "Get recent system activity")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved recent activity"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/activity/recent")
    public ResponseEntity<AdminDto.RecentActivity> getRecentActivity() {
        log.info("Getting recent activity for admin");
        
        // Get recent activity data
        var recentUsers = userService.getRecentUsers();
        var recentFranchises = franchiseService.getRecentFranchises();
        var recentApplications = applicationService.getRecentApplications();
        
        AdminDto.RecentActivity recentActivity = new AdminDto.RecentActivity(
                recentUsers, recentFranchises, recentApplications);
        
        return ResponseEntity.ok(recentActivity);
    }

    @Operation(summary = "Get platform overview", description = "Get comprehensive platform overview")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved platform overview"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/overview")
    public ResponseEntity<AdminDto.PlatformOverview> getPlatformOverview() {
        log.info("Getting platform overview for admin");
        
        // Collect comprehensive platform data
        UserService.UserStats userStats = userService.getUserStats();
        FranchiseService.FranchiseStats franchiseStats = franchiseService.getFranchiseStats();
        ApplicationService.ApplicationStats applicationStats = applicationService.getApplicationStats();
        PaymentService.PaymentStats paymentStats = paymentService.getPaymentStats();
        
        // Calculate additional metrics
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long newUsersLast30Days = userService.getUsersCreatedSince(thirtyDaysAgo);
        long newFranchisesLast30Days = franchiseService.getFranchisesCreatedSince(thirtyDaysAgo).size();
        long newApplicationsLast30Days = applicationService.getApplicationsCreatedSince(thirtyDaysAgo).size();
        
        AdminDto.PlatformOverview overview = new AdminDto.PlatformOverview(
                userStats, franchiseStats, applicationStats, paymentStats,
                newUsersLast30Days, newFranchisesLast30Days, newApplicationsLast30Days,
                LocalDateTime.now());
        
        return ResponseEntity.ok(overview);
    }

    @Operation(summary = "Export data", description = "Export platform data for backup or analysis")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully initiated data export"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/export")
    public ResponseEntity<AdminDto.ExportStatus> exportData(
            @RequestParam(defaultValue = "ALL") AdminDto.ExportType exportType) {
        log.info("Initiating data export of type: {}", exportType);
        
        // This would typically initiate an async export process
        // For now, return a simple status
        AdminDto.ExportStatus exportStatus = new AdminDto.ExportStatus(
                "INITIATED", "Data export has been initiated", LocalDateTime.now());
        
        return ResponseEntity.ok(exportStatus);
    }

    @Operation(summary = "Get audit logs", description = "Get system audit logs")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved audit logs"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/audit-logs")
    public ResponseEntity<AdminDto.AuditLogs> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        log.info("Getting audit logs with filters - page: {}, size: {}, userId: {}, action: {}", 
                page, size, userId, action);
        
        // This would typically query an audit log table
        // For now, return empty logs
        AdminDto.AuditLogs auditLogs = new AdminDto.AuditLogs(
                java.util.Collections.emptyList(), 0, page, size);
        
        return ResponseEntity.ok(auditLogs);
    }

    @Operation(summary = "Send system notification", description = "Send a system-wide notification to all users")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully sent system notification"),
        @ApiResponse(responseCode = "400", description = "Invalid notification data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @PostMapping("/notifications/system")
    public ResponseEntity<Void> sendSystemNotification(
            @RequestBody AdminDto.SystemNotificationRequest request) {
        log.info("Sending system notification: {}", request.getTitle());
        
        // Get all active users and send notification to each
        var activeUsers = userService.getActiveUsers();
        
        for (var user : activeUsers) {
            notificationService.createSystemAlertNotification(
                    user.getId(), request.getTitle(), request.getMessage(), request.getPriority());
        }
        
        log.info("Sent system notification to {} users", activeUsers.size());
        return ResponseEntity.ok().build();
    }
}
