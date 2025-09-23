package com.franchisehub.api.service;

import com.franchisehub.api.model.PaymentTransaction;
import com.franchisehub.api.model.PaymentRequest;
import com.franchisehub.api.model.User;
import com.franchisehub.api.model.Franchise;
import com.franchisehub.api.model.Application;
import com.franchisehub.api.repository.PaymentTransactionRepository;
import com.franchisehub.api.repository.PaymentRequestRepository;
import com.franchisehub.api.repository.UserRepository;
import com.franchisehub.api.repository.FranchiseRepository;
import com.franchisehub.api.repository.ApplicationRepository;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final UserRepository userRepository;
    private final FranchiseRepository franchiseRepository;
    private final ApplicationRepository applicationRepository;

    // ==================== PAYMENT TRANSACTIONS ====================

    /**
     * Get all payment transactions with pagination
     */
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> getAllTransactions(Pageable pageable) {
        log.debug("Getting all payment transactions with pagination: {}", pageable);
        return paymentTransactionRepository.findAll(pageable);
    }

    /**
     * Get payment transaction by ID
     */
    @Transactional(readOnly = true)
    public PaymentTransaction getTransactionById(String id) {
        log.debug("Getting payment transaction by ID: {}", id);
        return paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found with ID: " + id));
    }

    /**
     * Get transactions by user ID
     */
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> getTransactionsByUserId(String userId, Pageable pageable) {
        log.debug("Getting payment transactions by user ID: {} with pagination: {}", userId, pageable);
        return paymentTransactionRepository.findByUserId(userId, pageable);
    }

    /**
     * Get transactions by franchise ID
     */
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> getTransactionsByFranchiseId(String franchiseId, Pageable pageable) {
        log.debug("Getting payment transactions by franchise ID: {} with pagination: {}", franchiseId, pageable);
        return paymentTransactionRepository.findByFranchiseId(franchiseId, pageable);
    }

    /**
     * Get transactions by status
     */
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> getTransactionsByStatus(PaymentTransaction.TransactionStatus status, Pageable pageable) {
        log.debug("Getting payment transactions by status: {} with pagination: {}", status, pageable);
        return paymentTransactionRepository.findByStatus(status, pageable);
    }

    /**
     * Create a new payment transaction
     */
    public PaymentTransaction createTransaction(PaymentTransaction transaction, String userId) {
        log.debug("Creating new payment transaction for user: {}", userId);
        
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate franchise exists
        Franchise franchise = franchiseRepository.findById(transaction.getFranchiseId())
                .orElseThrow(() -> new ResourceNotFoundException("Franchise not found with ID: " + transaction.getFranchiseId()));

        // Set transaction details
        transaction.setUserId(userId);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());
        
        // Set default status if not provided
        if (transaction.getStatus() == null) {
            transaction.setStatus(PaymentTransaction.TransactionStatus.PENDING);
        }

        // Generate gateway order ID if not provided
        if (transaction.getGatewayOrderId() == null) {
            transaction.setGatewayOrderId("ORDER_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        }

        // Calculate platform fee (example: 2% of transaction amount)
        BigDecimal platformFeeRate = new BigDecimal("0.02");
        BigDecimal platformFee = transaction.getAmount().multiply(platformFeeRate);
        transaction.setPlatformFee(platformFee);
        transaction.setNetAmount(transaction.getAmount().subtract(platformFee));

        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
        log.info("Created payment transaction with ID: {}", savedTransaction.getId());
        return savedTransaction;
    }

    /**
     * Update transaction status
     */
    public PaymentTransaction updateTransactionStatus(String id, PaymentTransaction.TransactionStatus status, 
                                                    String gatewayTransactionId, String failureReason) {
        log.debug("Updating transaction status: {} to {}", id, status);
        
        PaymentTransaction transaction = getTransactionById(id);
        
        transaction.setStatus(status);
        transaction.setUpdatedAt(LocalDateTime.now());
        
        if (gatewayTransactionId != null) {
            transaction.setGatewayTransactionId(gatewayTransactionId);
        }
        
        if (status == PaymentTransaction.TransactionStatus.SUCCESS) {
            transaction.setProcessedAt(LocalDateTime.now());
        } else if (status == PaymentTransaction.TransactionStatus.FAILED && failureReason != null) {
            transaction.setFailureReason(failureReason);
        }

        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);
        log.info("Updated transaction status for ID: {} to {}", id, status);
        return savedTransaction;
    }

    /**
     * Process payment for application fee
     */
    public PaymentTransaction processApplicationFeePayment(String applicationId, String userId, 
                                                         PaymentTransaction.PaymentMethod method) {
        log.debug("Processing application fee payment for application: {} by user: {}", applicationId, userId);
        
        // Validate application exists
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + applicationId));
        
        // Verify user owns the application
        if (!application.getApplicantId().equals(userId)) {
            throw new BadRequestException("You can only pay for your own applications");
        }

        // Check if payment is already made
        if (application.getPaymentStatus() == Application.PaymentStatus.PAID) {
            throw new BadRequestException("Application fee is already paid");
        }

        // Create payment transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setType(PaymentTransaction.TransactionType.APPLICATION_FEE);
        transaction.setMethod(method);
        transaction.setAmount(application.getApplicationFee());
        transaction.setCurrency("INR");
        transaction.setDescription("Application fee payment for " + application.getFranchiseName());
        transaction.setFranchiseId(application.getFranchiseId());
        transaction.setApplicationId(applicationId);

        PaymentTransaction savedTransaction = createTransaction(transaction, userId);
        
        // Update application payment status
        application.setPaymentTransactionId(savedTransaction.getId());
        application.setPaymentStatus(Application.PaymentStatus.PAID);
        application.setPaidAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedTransaction;
    }

    // ==================== PAYMENT REQUESTS ====================

    /**
     * Get all payment requests with pagination
     */
    @Transactional(readOnly = true)
    public Page<PaymentRequest> getAllPaymentRequests(Pageable pageable) {
        log.debug("Getting all payment requests with pagination: {}", pageable);
        return paymentRequestRepository.findAll(pageable);
    }

    /**
     * Get payment request by ID
     */
    @Transactional(readOnly = true)
    public PaymentRequest getPaymentRequestById(String id) {
        log.debug("Getting payment request by ID: {}", id);
        return paymentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment request not found with ID: " + id));
    }

    /**
     * Get payment requests by recipient (to user)
     */
    @Transactional(readOnly = true)
    public Page<PaymentRequest> getPaymentRequestsByRecipient(String toUserId, Pageable pageable) {
        log.debug("Getting payment requests by recipient: {} with pagination: {}", toUserId, pageable);
        return paymentRequestRepository.findByToUserId(toUserId, pageable);
    }

    /**
     * Get payment requests by sender (from user)
     */
    @Transactional(readOnly = true)
    public Page<PaymentRequest> getPaymentRequestsBySender(String fromUserId, Pageable pageable) {
        log.debug("Getting payment requests by sender: {} with pagination: {}", fromUserId, pageable);
        return paymentRequestRepository.findByFromUserId(fromUserId, pageable);
    }

    /**
     * Get payment requests by status
     */
    @Transactional(readOnly = true)
    public Page<PaymentRequest> getPaymentRequestsByStatus(PaymentRequest.PaymentRequestStatus status, Pageable pageable) {
        log.debug("Getting payment requests by status: {} with pagination: {}", status, pageable);
        return paymentRequestRepository.findByStatus(status, pageable);
    }

    /**
     * Create a new payment request
     */
    public PaymentRequest createPaymentRequest(PaymentRequest paymentRequest, String fromUserId) {
        log.debug("Creating new payment request from user: {} to user: {}", fromUserId, paymentRequest.getToUserId());
        
        // Validate users exist
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResourceNotFoundException("From user not found with ID: " + fromUserId));
        
        User toUser = userRepository.findById(paymentRequest.getToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("To user not found with ID: " + paymentRequest.getToUserId()));

        // Validate franchise exists
        Franchise franchise = franchiseRepository.findById(paymentRequest.getFranchiseId())
                .orElseThrow(() -> new ResourceNotFoundException("Franchise not found with ID: " + paymentRequest.getFranchiseId()));

        // Set payment request details
        paymentRequest.setFromUserId(fromUserId);
        paymentRequest.setCreatedAt(LocalDateTime.now());
        paymentRequest.setUpdatedAt(LocalDateTime.now());
        
        // Set default status if not provided
        if (paymentRequest.getStatus() == null) {
            paymentRequest.setStatus(PaymentRequest.PaymentRequestStatus.PENDING);
        }

        // Set default currency if not provided
        if (paymentRequest.getCurrency() == null) {
            paymentRequest.setCurrency("INR");
        }

        PaymentRequest savedRequest = paymentRequestRepository.save(paymentRequest);
        log.info("Created payment request with ID: {}", savedRequest.getId());
        return savedRequest;
    }

    /**
     * Pay a payment request
     */
    public PaymentTransaction payPaymentRequest(String requestId, String userId, PaymentTransaction.PaymentMethod method) {
        log.debug("Paying payment request: {} by user: {}", requestId, userId);
        
        PaymentRequest paymentRequest = getPaymentRequestById(requestId);
        
        // Verify user is the recipient
        if (!paymentRequest.getToUserId().equals(userId)) {
            throw new BadRequestException("You can only pay requests sent to you");
        }

        // Check if request is already paid
        if (paymentRequest.getStatus() == PaymentRequest.PaymentRequestStatus.PAID) {
            throw new BadRequestException("Payment request is already paid");
        }

        // Check if request is cancelled
        if (paymentRequest.getStatus() == PaymentRequest.PaymentRequestStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay cancelled payment request");
        }

        // Create payment transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setType(PaymentTransaction.TransactionType.valueOf(paymentRequest.getType().name()));
        transaction.setMethod(method);
        transaction.setAmount(paymentRequest.getAmount());
        transaction.setCurrency(paymentRequest.getCurrency());
        transaction.setDescription("Payment for: " + paymentRequest.getTitle());
        transaction.setFranchiseId(paymentRequest.getFranchiseId());
        transaction.setApplicationId(paymentRequest.getApplicationId());
        transaction.setPaymentRequestId(requestId);

        PaymentTransaction savedTransaction = createTransaction(transaction, userId);
        
        // Update payment request status
        paymentRequest.setStatus(PaymentRequest.PaymentRequestStatus.PAID);
        paymentRequest.setPaidAt(LocalDateTime.now());
        paymentRequest.setPaymentTransactionId(savedTransaction.getId());
        // Convert PaymentTransaction.PaymentMethod to PaymentRequest.PaymentMethod
        PaymentRequest.PaymentMethod requestMethod = convertToRequestPaymentMethod(method);
        paymentRequest.setPaymentMethod(requestMethod);
        paymentRequest.setUpdatedAt(LocalDateTime.now());
        paymentRequestRepository.save(paymentRequest);

        return savedTransaction;
    }

    /**
     * Cancel a payment request
     */
    public PaymentRequest cancelPaymentRequest(String requestId, String userId) {
        log.debug("Cancelling payment request: {} by user: {}", requestId, userId);
        
        PaymentRequest paymentRequest = getPaymentRequestById(requestId);
        
        // Verify user is the sender
        if (!paymentRequest.getFromUserId().equals(userId)) {
            throw new BadRequestException("You can only cancel requests you created");
        }

        // Check if request can be cancelled
        if (paymentRequest.getStatus() == PaymentRequest.PaymentRequestStatus.PAID) {
            throw new BadRequestException("Cannot cancel paid payment request");
        }

        if (paymentRequest.getStatus() == PaymentRequest.PaymentRequestStatus.CANCELLED) {
            throw new BadRequestException("Payment request is already cancelled");
        }

        // Update status
        paymentRequest.setStatus(PaymentRequest.PaymentRequestStatus.CANCELLED);
        paymentRequest.setUpdatedAt(LocalDateTime.now());

        PaymentRequest savedRequest = paymentRequestRepository.save(paymentRequest);
        log.info("Cancelled payment request with ID: {}", requestId);
        return savedRequest;
    }

    /**
     * Get payment statistics
     */
    @Transactional(readOnly = true)
    public PaymentStats getPaymentStats() {
        log.debug("Getting payment statistics");
        
        long totalTransactions = paymentTransactionRepository.count();
        long successfulTransactions = paymentTransactionRepository.countByStatus(PaymentTransaction.TransactionStatus.SUCCESS);
        long pendingTransactions = paymentTransactionRepository.countByStatus(PaymentTransaction.TransactionStatus.PENDING);
        long failedTransactions = paymentTransactionRepository.countByStatus(PaymentTransaction.TransactionStatus.FAILED);
        
        BigDecimal totalAmount = paymentTransactionRepository.sumAmountByStatus(PaymentTransaction.TransactionStatus.SUCCESS);
        if (totalAmount == null) totalAmount = BigDecimal.ZERO;
        
        return new PaymentStats(totalTransactions, successfulTransactions, pendingTransactions, failedTransactions, totalAmount);
    }

    /**
     * Inner class for payment statistics
     */
    public static class PaymentStats {
        private final long totalTransactions;
        private final long successfulTransactions;
        private final long pendingTransactions;
        private final long failedTransactions;
        private final BigDecimal totalAmount;

        public PaymentStats(long totalTransactions, long successfulTransactions, long pendingTransactions, 
                          long failedTransactions, BigDecimal totalAmount) {
            this.totalTransactions = totalTransactions;
            this.successfulTransactions = successfulTransactions;
            this.pendingTransactions = pendingTransactions;
            this.failedTransactions = failedTransactions;
            this.totalAmount = totalAmount;
        }

        public long getTotalTransactions() { return totalTransactions; }
        public long getSuccessfulTransactions() { return successfulTransactions; }
        public long getPendingTransactions() { return pendingTransactions; }
        public long getFailedTransactions() { return failedTransactions; }
        public BigDecimal getTotalAmount() { return totalAmount; }
    }

    /**
     * Convert PaymentTransaction.PaymentMethod to PaymentRequest.PaymentMethod
     */
    private PaymentRequest.PaymentMethod convertToRequestPaymentMethod(PaymentTransaction.PaymentMethod transactionMethod) {
        switch (transactionMethod) {
            case UPI:
                return PaymentRequest.PaymentMethod.UPI;
            case CREDIT_CARD:
                return PaymentRequest.PaymentMethod.CREDIT_CARD;
            case DEBIT_CARD:
                return PaymentRequest.PaymentMethod.DEBIT_CARD;
            case NET_BANKING:
                return PaymentRequest.PaymentMethod.NET_BANKING;
            case WALLET:
                return PaymentRequest.PaymentMethod.WALLET;
            case BANK_TRANSFER:
                return PaymentRequest.PaymentMethod.BANK_TRANSFER;
            default:
                throw new IllegalArgumentException("Unsupported payment method: " + transactionMethod);
        }
    }
}
