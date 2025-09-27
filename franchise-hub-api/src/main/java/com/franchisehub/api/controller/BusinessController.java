package com.franchisehub.api.controller;

import com.franchisehub.api.dto.BusinessDto;
import com.franchisehub.api.model.User;
import com.franchisehub.api.service.ApplicationService;
import com.franchisehub.api.service.FranchiseService;
import com.franchisehub.api.service.PaymentService;
import com.franchisehub.api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/business")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Business", description = "Business user operations")
public class BusinessController {

    private final UserService userService;
    private final FranchiseService franchiseService;
    private final ApplicationService applicationService;
    private final PaymentService paymentService;

    @Operation(summary = "Get business dashboard statistics", description = "Get dashboard statistics for business users")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business users only")
    })
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<BusinessDto.DashboardStats> getDashboardStats(Authentication authentication) {
        log.info("Getting business dashboard statistics for user: {}", authentication.getName());
        
        // Get current user
        User currentUser = userService.getUserByEmail(authentication.getName());
        String businessOwnerId = currentUser.getId();
        
        // Collect statistics from all services for this business owner
        FranchiseService.FranchiseStats franchiseStats = franchiseService.getFranchiseStatsByBusinessOwner(businessOwnerId);
        ApplicationService.ApplicationStats applicationStats = applicationService.getApplicationStatsByBusinessOwner(businessOwnerId);
        PaymentService.PaymentStats paymentStats = paymentService.getPaymentStatsByBusinessOwner(businessOwnerId);
        
        // Calculate additional metrics
        BigDecimal totalRevenue = paymentStats.getTotalRevenue();
        BigDecimal monthlyRevenue = paymentStats.getMonthlyRevenue();
        double conversionRate = applicationStats.getTotalApplications() > 0 
            ? (double) applicationStats.getApprovedApplications() / applicationStats.getTotalApplications() * 100 
            : 0.0;
        
        // Create business dashboard stats
        BusinessDto.DashboardStats dashboardStats = new BusinessDto.DashboardStats(
                franchiseStats.getTotal(),
                franchiseStats.getActive(),
                franchiseStats.getPending(),
                applicationStats.getTotalApplications(),
                applicationStats.getApprovedApplications(),
                applicationStats.getPendingApplications(),
                totalRevenue,
                monthlyRevenue,
                Math.round(conversionRate * 100.0) / 100.0
        );
        
        return ResponseEntity.ok(dashboardStats);
    }

    @Operation(summary = "Get business franchise statistics", description = "Get franchise statistics for business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchise statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business users only")
    })
    @GetMapping("/stats/franchises")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<FranchiseService.FranchiseStats> getFranchiseStats(Authentication authentication) {
        log.info("Getting franchise statistics for business user: {}", authentication.getName());
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        FranchiseService.FranchiseStats stats = franchiseService.getFranchiseStatsByBusinessOwner(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get business application statistics", description = "Get application statistics for business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved application statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business users only")
    })
    @GetMapping("/stats/applications")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<ApplicationService.ApplicationStats> getApplicationStats(Authentication authentication) {
        log.info("Getting application statistics for business user: {}", authentication.getName());
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        ApplicationService.ApplicationStats stats = applicationService.getApplicationStatsByBusinessOwner(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get business payment statistics", description = "Get payment statistics for business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved payment statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business users only")
    })
    @GetMapping("/stats/payments")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<PaymentService.PaymentStats> getPaymentStats(Authentication authentication) {
        log.info("Getting payment statistics for business user: {}", authentication.getName());
        
        User currentUser = userService.getUserByEmail(authentication.getName());
        PaymentService.PaymentStats stats = paymentService.getPaymentStatsByBusinessOwner(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
}
