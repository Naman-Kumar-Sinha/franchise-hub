package com.franchisehub.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class PaymentRequest {

    @Id
    private String id;

    @Column(nullable = false)
    private String fromUserId;

    @Column(nullable = false)
    private String toUserId;

    @Column(nullable = false)
    private String franchiseId;

    private String applicationId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentRequestType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentRequestStatus status;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Payment Information
    private String paymentTransactionId;
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    // Reminder Information
    private Integer remindersSent = 0;
    private LocalDateTime lastReminderSent;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Enums
    public enum PaymentRequestType {
        APPLICATION_FEE,
        FRANCHISE_FEE,
        ROYALTY_PAYMENT,
        MARKETING_FEE,
        SETUP_FEE,
        TRAINING_FEE,
        OTHER
    }

    public enum PaymentRequestStatus {
        PENDING,
        PAID,
        OVERDUE,
        CANCELLED,
        REFUNDED
    }

    public enum PaymentMethod {
        UPI,
        CREDIT_CARD,
        DEBIT_CARD,
        NET_BANKING,
        WALLET,
        BANK_TRANSFER
    }
}
