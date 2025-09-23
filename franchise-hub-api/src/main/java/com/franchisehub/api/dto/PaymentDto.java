package com.franchisehub.api.dto;

import com.franchisehub.api.model.PaymentTransaction;
import com.franchisehub.api.model.PaymentRequest;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateTransactionRequest {
        @NotNull(message = "Transaction type is required")
        private PaymentTransaction.TransactionType type;
        
        @NotNull(message = "Payment method is required")
        private PaymentTransaction.PaymentMethod method;
        
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;
        
        @NotBlank(message = "Currency is required")
        private String currency = "INR";
        
        @NotBlank(message = "Description is required")
        private String description;
        
        private String franchiseId;
        private String applicationId;
        private String paymentRequestId;
        
        // Payment Details
        private String upiId;
        private String cardNumber;
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String bankName;
        private String accountNumber;
        private String ifscCode;
        private String walletProvider;
        private String walletId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateTransactionStatusRequest {
        @NotNull(message = "Status is required")
        private PaymentTransaction.TransactionStatus status;
        
        private String gatewayTransactionId;
        private String failureReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessApplicationFeeRequest {
        @NotNull(message = "Payment method is required")
        private PaymentTransaction.PaymentMethod paymentMethod;
        
        // Payment Details
        private String upiId;
        private String cardNumber;
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String bankName;
        private String accountNumber;
        private String ifscCode;
        private String walletProvider;
        private String walletId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePaymentRequestRequest {
        @NotBlank(message = "Recipient user ID is required")
        private String toUserId;
        
        @NotNull(message = "Payment request type is required")
        private PaymentRequest.PaymentRequestType type;
        
        @NotBlank(message = "Title is required")
        private String title;
        
        @NotBlank(message = "Description is required")
        private String description;
        
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal amount;
        
        @NotBlank(message = "Currency is required")
        private String currency = "INR";
        
        private String franchiseId;
        private String applicationId;
        private LocalDateTime dueDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayPaymentRequestRequest {
        @NotNull(message = "Payment method is required")
        private PaymentTransaction.PaymentMethod paymentMethod;
        
        // Payment Details
        private String upiId;
        private String cardNumber;
        private String cardHolderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        private String bankName;
        private String accountNumber;
        private String ifscCode;
        private String walletProvider;
        private String walletId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private String id;
        private String userId;
        private String franchiseId;
        private String applicationId;
        private String paymentRequestId;
        private PaymentTransaction.TransactionType type;
        private PaymentTransaction.PaymentMethod method;
        private PaymentTransaction.TransactionStatus status;
        private BigDecimal amount;
        private String currency;
        private String description;
        private String gatewayOrderId;
        private String gatewayTransactionId;
        private BigDecimal platformFee;
        private BigDecimal netAmount;
        private String failureReason;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequestResponse {
        private String id;
        private String fromUserId;
        private String fromUserName;
        private String toUserId;
        private String toUserName;
        private String franchiseId;
        private String franchiseName;
        private String applicationId;
        private PaymentRequest.PaymentRequestType type;
        private PaymentRequest.PaymentRequestStatus status;
        private String title;
        private String description;
        private BigDecimal amount;
        private String currency;
        private LocalDateTime dueDate;
        private LocalDateTime paidAt;
        private String paymentTransactionId;
        private PaymentTransaction.PaymentMethod paymentMethod;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentStats {
        private long totalTransactions;
        private long successfulTransactions;
        private long pendingTransactions;
        private long failedTransactions;
        private BigDecimal totalAmount;
        private BigDecimal totalPlatformFees;
        private BigDecimal totalNetAmount;
        private long totalPaymentRequests;
        private long paidPaymentRequests;
        private long pendingPaymentRequests;
        private long cancelledPaymentRequests;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {
        private String id;
        private PaymentTransaction.TransactionType type;
        private PaymentTransaction.PaymentMethod method;
        private PaymentTransaction.TransactionStatus status;
        private BigDecimal amount;
        private String currency;
        private String description;
        private String franchiseName;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequestSummary {
        private String id;
        private String fromUserName;
        private String toUserName;
        private PaymentRequest.PaymentRequestType type;
        private PaymentRequest.PaymentRequestStatus status;
        private String title;
        private BigDecimal amount;
        private String currency;
        private LocalDateTime dueDate;
        private LocalDateTime createdAt;
    }
}
