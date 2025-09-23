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
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class PaymentTransaction {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String franchiseId;

    private String applicationId;

    private String paymentRequestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal platformFee;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal netAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status;

    @Column(nullable = false)
    private String currency = "INR";

    // Payment Gateway Information
    private String gatewayTransactionId;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String gatewaySignature;

    @Embedded
    private PaymentDetails paymentDetails;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String failureReason;

    private LocalDateTime processedAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Embedded Classes
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentDetails {
        // UPI Details
        private String upiId;
        private String upiTransactionId;
        
        // Card Details (masked)
        private String cardLast4;
        private String cardType;
        private String cardNetwork;
        
        // Bank Details
        private String bankName;
        private String bankTransactionId;
        
        // Wallet Details
        private String walletName;
        private String walletTransactionId;
    }

    // Enums
    public enum TransactionType {
        APPLICATION_FEE,
        FRANCHISE_FEE,
        ROYALTY_PAYMENT,
        MARKETING_FEE,
        REFUND,
        SETTLEMENT
    }

    public enum PaymentMethod {
        UPI,
        CREDIT_CARD,
        DEBIT_CARD,
        NET_BANKING,
        WALLET,
        BANK_TRANSFER
    }

    public enum TransactionStatus {
        PENDING,
        PROCESSING,
        SUCCESS,
        FAILED,
        CANCELLED,
        REFUNDED,
        PARTIALLY_REFUNDED
    }
}
