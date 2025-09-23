package com.franchisehub.api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.UNREAD;

    // Related Entity IDs
    private String applicationId;
    private String franchiseId;
    private String paymentRequestId;

    // Action Information
    private String actionUrl;
    private String actionText;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority = NotificationPriority.MEDIUM;

    private LocalDateTime expiresAt;
    private LocalDateTime readAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enums
    public enum NotificationType {
        APPLICATION_UPDATE,
        PAYMENT_REQUEST,
        PARTNERSHIP_UPDATE,
        SYSTEM_ALERT,
        DOCUMENT_REQUIRED,
        APPROVAL_NOTIFICATION
    }

    public enum NotificationStatus {
        READ, UNREAD
    }

    public enum NotificationPriority {
        LOW, MEDIUM, HIGH, URGENT
    }
}
