package com.franchisehub.api.dto;

import com.franchisehub.api.model.Notification;
import com.franchisehub.api.model.User;
import com.franchisehub.api.model.Franchise;
import com.franchisehub.api.model.Application;
import com.franchisehub.api.service.UserService;
import com.franchisehub.api.service.FranchiseService;
import com.franchisehub.api.service.ApplicationService;
import com.franchisehub.api.service.PaymentService;
import com.franchisehub.api.service.NotificationService;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AdminDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private UserService.UserStats userStats;
        private FranchiseService.FranchiseStats franchiseStats;
        private ApplicationService.ApplicationStats applicationStats;
        private PaymentService.PaymentStats paymentStats;
        private NotificationService.NotificationStats notificationStats;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrowthStats {
        private long newUsersLast30Days;
        private long newFranchisesLast30Days;
        private long newApplicationsLast30Days;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemHealth {
        private boolean databaseHealthy;
        private boolean servicesHealthy;
        private long uptime;
        private LocalDateTime lastChecked;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private List<User> recentUsers;
        private List<Franchise> recentFranchises;
        private List<Application> recentApplications;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlatformOverview {
        private UserService.UserStats userStats;
        private FranchiseService.FranchiseStats franchiseStats;
        private ApplicationService.ApplicationStats applicationStats;
        private PaymentService.PaymentStats paymentStats;
        private long newUsersLast30Days;
        private long newFranchisesLast30Days;
        private long newApplicationsLast30Days;
        private LocalDateTime generatedAt;
    }

    public enum ExportType {
        ALL, USERS, FRANCHISES, APPLICATIONS, PAYMENTS, NOTIFICATIONS
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportStatus {
        private String status;
        private String message;
        private LocalDateTime initiatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogs {
        private List<AuditLogEntry> logs;
        private long totalCount;
        private int currentPage;
        private int pageSize;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditLogEntry {
        private String id;
        private String userId;
        private String userEmail;
        private String action;
        private String resource;
        private String resourceId;
        private String details;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime timestamp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemNotificationRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        private String title;
        
        @NotBlank(message = "Message is required")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        private String message;
        
        @NotNull(message = "Priority is required")
        private Notification.NotificationPriority priority;
        
        private String actionText;
        private String actionUrl;
        private LocalDateTime expiresAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemConfiguration {
        private String applicationName;
        private String version;
        private String environment;
        private boolean maintenanceMode;
        private String maintenanceMessage;
        private boolean registrationEnabled;
        private boolean emailVerificationRequired;
        private int maxLoginAttempts;
        private int sessionTimeoutMinutes;
        private boolean auditLoggingEnabled;
        private String supportEmail;
        private String supportPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateSystemConfigurationRequest {
        private String applicationName;
        private boolean maintenanceMode;
        private String maintenanceMessage;
        private boolean registrationEnabled;
        private boolean emailVerificationRequired;
        
        @Min(value = 3, message = "Max login attempts must be at least 3")
        @Max(value = 10, message = "Max login attempts must not exceed 10")
        private int maxLoginAttempts;
        
        @Min(value = 15, message = "Session timeout must be at least 15 minutes")
        @Max(value = 480, message = "Session timeout must not exceed 8 hours")
        private int sessionTimeoutMinutes;
        
        private boolean auditLoggingEnabled;
        
        @Email(message = "Invalid support email format")
        private String supportEmail;
        
        @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid support phone format")
        private String supportPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseStats {
        private long totalTables;
        private long totalRecords;
        private String databaseSize;
        private String indexSize;
        private double fragmentationPercentage;
        private LocalDateTime lastBackup;
        private LocalDateTime lastOptimization;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private double averageResponseTime;
        private long totalRequests;
        private long successfulRequests;
        private long failedRequests;
        private double errorRate;
        private double cpuUsage;
        private double memoryUsage;
        private double diskUsage;
        private LocalDateTime collectedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityReport {
        private long failedLoginAttempts;
        private long suspiciousActivities;
        private long blockedIpAddresses;
        private long activeUserSessions;
        private LocalDateTime lastSecurityScan;
        private List<SecurityIncident> recentIncidents;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityIncident {
        private String id;
        private String type;
        private String severity;
        private String description;
        private String ipAddress;
        private String userAgent;
        private String userId;
        private LocalDateTime timestamp;
        private String status;
        private String resolution;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackupStatus {
        private String status;
        private LocalDateTime lastBackup;
        private LocalDateTime nextScheduledBackup;
        private String backupSize;
        private String backupLocation;
        private boolean autoBackupEnabled;
        private int retentionDays;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaintenanceSchedule {
        private String id;
        private String title;
        private String description;
        private LocalDateTime scheduledStart;
        private LocalDateTime scheduledEnd;
        private LocalDateTime actualStart;
        private LocalDateTime actualEnd;
        private String status;
        private String type;
        private boolean notifyUsers;
        private String createdBy;
        private LocalDateTime createdAt;
    }
}
