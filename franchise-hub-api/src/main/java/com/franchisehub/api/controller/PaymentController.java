package com.franchisehub.api.controller;

import com.franchisehub.api.model.PaymentTransaction;
import com.franchisehub.api.model.PaymentRequest;
import com.franchisehub.api.service.PaymentService;
import com.franchisehub.api.dto.PaymentDto;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.exception.BadRequestException;
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

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "APIs for managing payments and transactions")
public class PaymentController {

    private final PaymentService paymentService;

    // ==================== PAYMENT TRANSACTIONS ====================

    @Operation(summary = "Get all transactions", description = "Retrieve all payment transactions (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentTransaction>> getAllTransactions(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting all payment transactions with pagination: {}", pageable);
        Page<PaymentTransaction> transactions = paymentService.getAllTransactions(pageable);
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "Get transaction by ID", description = "Retrieve a specific payment transaction by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transaction"),
        @ApiResponse(responseCode = "404", description = "Transaction not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/transactions/{id}")
    @PreAuthorize("hasRole('ADMIN') or @paymentService.isTransactionOwner(#id, authentication.name)")
    public ResponseEntity<PaymentTransaction> getTransactionById(
            @Parameter(description = "Transaction ID") @PathVariable String id) {
        log.info("Getting payment transaction by ID: {}", id);
        PaymentTransaction transaction = paymentService.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @Operation(summary = "Get transactions by user", description = "Retrieve payment transactions for a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/transactions/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<Page<PaymentTransaction>> getTransactionsByUser(
            @Parameter(description = "User ID") @PathVariable String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting payment transactions by user: {} with pagination: {}", userId, pageable);
        Page<PaymentTransaction> transactions = paymentService.getTransactionsByUserId(userId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "Get transactions by franchise", description = "Retrieve payment transactions for a specific franchise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/transactions/franchise/{franchiseId}")
    @PreAuthorize("hasRole('ADMIN') or @franchiseService.isFranchiseOwner(#franchiseId, authentication.name)")
    public ResponseEntity<Page<PaymentTransaction>> getTransactionsByFranchise(
            @Parameter(description = "Franchise ID") @PathVariable String franchiseId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting payment transactions by franchise: {} with pagination: {}", franchiseId, pageable);
        Page<PaymentTransaction> transactions = paymentService.getTransactionsByFranchiseId(franchiseId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "Get transactions by status", description = "Retrieve payment transactions by status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/transactions/status/{status}")
    public ResponseEntity<Page<PaymentTransaction>> getTransactionsByStatus(
            @Parameter(description = "Transaction Status") @PathVariable PaymentTransaction.TransactionStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting payment transactions by status: {} with pagination: {}", status, pageable);
        
        // Filter by user role
        Page<PaymentTransaction> transactions;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            transactions = paymentService.getTransactionsByStatus(status, pageable);
        } else {
            transactions = paymentService.getTransactionsByUserId(authentication.getName(), pageable);
        }
        
        return ResponseEntity.ok(transactions);
    }

    @Operation(summary = "Create payment transaction", description = "Create a new payment transaction")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Transaction created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid transaction data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/transactions")
    public ResponseEntity<PaymentTransaction> createTransaction(
            @Valid @RequestBody PaymentDto.CreateTransactionRequest request,
            Authentication authentication) {
        log.info("Creating payment transaction by user: {}", authentication.getName());
        
        // Convert DTO to entity
        PaymentTransaction transaction = mapToTransaction(request);
        
        PaymentTransaction createdTransaction = paymentService.createTransaction(transaction, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    @Operation(summary = "Update transaction status", description = "Update payment transaction status (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Transaction status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only"),
        @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    @PatchMapping("/transactions/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentTransaction> updateTransactionStatus(
            @Parameter(description = "Transaction ID") @PathVariable String id,
            @Valid @RequestBody PaymentDto.UpdateTransactionStatusRequest request) {
        log.info("Updating transaction status: {} to {}", id, request.getStatus());
        
        PaymentTransaction updatedTransaction = paymentService.updateTransactionStatus(
                id, request.getStatus(), request.getGatewayTransactionId(), request.getFailureReason());
        return ResponseEntity.ok(updatedTransaction);
    }

    @Operation(summary = "Process application fee payment", description = "Process payment for application fee")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment processed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payment data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/application-fee/{applicationId}")
    public ResponseEntity<PaymentTransaction> processApplicationFeePayment(
            @Parameter(description = "Application ID") @PathVariable String applicationId,
            @Valid @RequestBody PaymentDto.ProcessApplicationFeeRequest request,
            Authentication authentication) {
        log.info("Processing application fee payment for application: {} by user: {}", applicationId, authentication.getName());
        
        PaymentTransaction transaction = paymentService.processApplicationFeePayment(
                applicationId, authentication.getName(), request.getPaymentMethod());
        return ResponseEntity.ok(transaction);
    }

    // ==================== PAYMENT REQUESTS ====================

    @Operation(summary = "Get all payment requests", description = "Retrieve all payment requests (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment requests"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentRequest>> getAllPaymentRequests(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting all payment requests with pagination: {}", pageable);
        Page<PaymentRequest> requests = paymentService.getAllPaymentRequests(pageable);
        return ResponseEntity.ok(requests);
    }

    @Operation(summary = "Get payment request by ID", description = "Retrieve a specific payment request by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment request"),
        @ApiResponse(responseCode = "404", description = "Payment request not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/requests/{id}")
    @PreAuthorize("hasRole('ADMIN') or @paymentService.isPaymentRequestParticipant(#id, authentication.name)")
    public ResponseEntity<PaymentRequest> getPaymentRequestById(
            @Parameter(description = "Payment Request ID") @PathVariable String id) {
        log.info("Getting payment request by ID: {}", id);
        PaymentRequest request = paymentService.getPaymentRequestById(id);
        return ResponseEntity.ok(request);
    }

    @Operation(summary = "Get payment requests sent to user", description = "Retrieve payment requests sent to a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment requests"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/requests/to/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<Page<PaymentRequest>> getPaymentRequestsByRecipient(
            @Parameter(description = "User ID") @PathVariable String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting payment requests by recipient: {} with pagination: {}", userId, pageable);
        Page<PaymentRequest> requests = paymentService.getPaymentRequestsByRecipient(userId, pageable);
        return ResponseEntity.ok(requests);
    }

    @Operation(summary = "Get payment requests sent by user", description = "Retrieve payment requests sent by a specific user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment requests"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/requests/from/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.name")
    public ResponseEntity<Page<PaymentRequest>> getPaymentRequestsBySender(
            @Parameter(description = "User ID") @PathVariable String userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting payment requests by sender: {} with pagination: {}", userId, pageable);
        Page<PaymentRequest> requests = paymentService.getPaymentRequestsBySender(userId, pageable);
        return ResponseEntity.ok(requests);
    }

    @Operation(summary = "Get payment requests by status", description = "Retrieve payment requests by status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment requests"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/requests/status/{status}")
    public ResponseEntity<Page<PaymentRequest>> getPaymentRequestsByStatus(
            @Parameter(description = "Payment Request Status") @PathVariable PaymentRequest.PaymentRequestStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting payment requests by status: {} with pagination: {}", status, pageable);
        
        // Filter by user role
        Page<PaymentRequest> requests;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            requests = paymentService.getPaymentRequestsByStatus(status, pageable);
        } else {
            // For non-admin users, get requests where they are either sender or recipient
            requests = paymentService.getPaymentRequestsByRecipient(authentication.getName(), pageable);
        }
        
        return ResponseEntity.ok(requests);
    }

    @Operation(summary = "Create payment request", description = "Create a new payment request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Payment request created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payment request data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/requests")
    public ResponseEntity<PaymentRequest> createPaymentRequest(
            @Valid @RequestBody PaymentDto.CreatePaymentRequestRequest request,
            Authentication authentication) {
        log.info("Creating payment request by user: {}", authentication.getName());
        
        // Convert DTO to entity
        PaymentRequest paymentRequest = mapToPaymentRequest(request);
        
        PaymentRequest createdRequest = paymentService.createPaymentRequest(paymentRequest, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
    }

    @Operation(summary = "Pay payment request", description = "Pay a payment request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment request paid successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid payment data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Payment request not found")
    })
    @PostMapping("/requests/{id}/pay")
    @PreAuthorize("@paymentService.isPaymentRequestRecipient(#id, authentication.name)")
    public ResponseEntity<PaymentTransaction> payPaymentRequest(
            @Parameter(description = "Payment Request ID") @PathVariable String id,
            @Valid @RequestBody PaymentDto.PayPaymentRequestRequest request,
            Authentication authentication) {
        log.info("Paying payment request: {} by user: {}", id, authentication.getName());
        
        PaymentTransaction transaction = paymentService.payPaymentRequest(id, authentication.getName(), request.getPaymentMethod());
        return ResponseEntity.ok(transaction);
    }

    @Operation(summary = "Cancel payment request", description = "Cancel a payment request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment request cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Payment request cannot be cancelled"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Sender only"),
        @ApiResponse(responseCode = "404", description = "Payment request not found")
    })
    @PostMapping("/requests/{id}/cancel")
    @PreAuthorize("@paymentService.isPaymentRequestSender(#id, authentication.name)")
    public ResponseEntity<PaymentRequest> cancelPaymentRequest(
            @Parameter(description = "Payment Request ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Cancelling payment request: {} by user: {}", id, authentication.getName());
        
        PaymentRequest cancelledRequest = paymentService.cancelPaymentRequest(id, authentication.getName());
        return ResponseEntity.ok(cancelledRequest);
    }

    @Operation(summary = "Get payment statistics", description = "Get payment statistics (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentService.PaymentStats> getPaymentStats() {
        log.info("Getting payment statistics");
        PaymentService.PaymentStats stats = paymentService.getPaymentStats();
        return ResponseEntity.ok(stats);
    }

    // Helper methods for DTO mapping
    private PaymentTransaction mapToTransaction(PaymentDto.CreateTransactionRequest request) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setType(request.getType());
        transaction.setMethod(request.getMethod());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(request.getCurrency());
        transaction.setDescription(request.getDescription());
        transaction.setFranchiseId(request.getFranchiseId());
        transaction.setApplicationId(request.getApplicationId());
        return transaction;
    }

    private PaymentRequest mapToPaymentRequest(PaymentDto.CreatePaymentRequestRequest request) {
        PaymentRequest paymentRequest = new PaymentRequest();
        paymentRequest.setToUserId(request.getToUserId());
        paymentRequest.setType(request.getType());
        paymentRequest.setTitle(request.getTitle());
        paymentRequest.setDescription(request.getDescription());
        paymentRequest.setAmount(request.getAmount());
        paymentRequest.setCurrency(request.getCurrency());
        paymentRequest.setFranchiseId(request.getFranchiseId());
        paymentRequest.setApplicationId(request.getApplicationId());
        paymentRequest.setDueDate(request.getDueDate());
        return paymentRequest;
    }
}
