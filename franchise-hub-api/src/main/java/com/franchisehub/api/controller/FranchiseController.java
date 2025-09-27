package com.franchisehub.api.controller;

import com.franchisehub.api.model.Franchise;
import com.franchisehub.api.model.User;
import com.franchisehub.api.service.FranchiseService;
import com.franchisehub.api.service.UserService;
import com.franchisehub.api.dto.FranchiseDto;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/franchises")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Franchise Management", description = "APIs for managing franchises")
public class FranchiseController {

    private final FranchiseService franchiseService;
    private final UserService userService;

    @Operation(summary = "Get all franchises", description = "Retrieve all franchises with pagination and sorting")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchises"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<Page<Franchise>> getAllFranchises(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting franchises with pagination: {} for user: {}", pageable, authentication.getName());

        // Get current user
        User currentUser = userService.getUserByEmail(authentication.getName());

        Page<Franchise> franchises;
        if (currentUser.getRole() == User.UserRole.BUSINESS) {
            // Business users see only their own franchises
            franchises = franchiseService.getFranchisesByBusinessOwnerId(currentUser.getId(), pageable);
        } else {
            // Admin and Partner users see all franchises
            franchises = franchiseService.getAllFranchises(pageable);
        }

        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Get active franchises", description = "Retrieve all active franchises")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved active franchises"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/active")
    public ResponseEntity<List<Franchise>> getActiveFranchises() {
        log.info("Getting all active franchises");
        List<Franchise> franchises = franchiseService.getAllActiveFranchises();
        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Get franchise by ID", description = "Retrieve a specific franchise by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchise"),
        @ApiResponse(responseCode = "404", description = "Franchise not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Franchise> getFranchiseById(
            @Parameter(description = "Franchise ID") @PathVariable String id) {
        log.info("Getting franchise by ID: {}", id);
        Franchise franchise = franchiseService.getFranchiseById(id);
        return ResponseEntity.ok(franchise);
    }

    @Operation(summary = "Get franchises by business owner", description = "Retrieve franchises owned by a specific business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchises"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/business-owner/{businessOwnerId}")
    @PreAuthorize("hasRole('ADMIN') or #businessOwnerId == authentication.name")
    public ResponseEntity<Page<Franchise>> getFranchisesByBusinessOwner(
            @Parameter(description = "Business Owner ID") @PathVariable String businessOwnerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting franchises by business owner: {} with pagination: {}", businessOwnerId, pageable);
        Page<Franchise> franchises = franchiseService.getFranchisesByBusinessOwnerId(businessOwnerId, pageable);
        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Get franchises by category", description = "Retrieve franchises by category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved franchises"),
        @ApiResponse(responseCode = "400", description = "Invalid category"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<Franchise>> getFranchisesByCategory(
            @Parameter(description = "Franchise Category") @PathVariable Franchise.FranchiseCategory category,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting franchises by category: {} with pagination: {}", category, pageable);
        Page<Franchise> franchises = franchiseService.getFranchisesByCategory(category, pageable);
        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Search franchises", description = "Search franchises by name or description")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved search results"),
        @ApiResponse(responseCode = "400", description = "Invalid search parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/search")
    public ResponseEntity<Page<Franchise>> searchFranchises(
            @Parameter(description = "Search term") @RequestParam String q,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Searching franchises with term: {} and pagination: {}", q, pageable);
        
        if (q == null || q.trim().isEmpty()) {
            throw new BadRequestException("Search term cannot be empty");
        }
        
        Page<Franchise> franchises = franchiseService.searchFranchises(q.trim(), pageable);
        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Filter franchises by investment", description = "Filter franchises by investment range")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved filtered franchises"),
        @ApiResponse(responseCode = "400", description = "Invalid investment range"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/filter/investment")
    public ResponseEntity<Page<Franchise>> filterByInvestment(
            @Parameter(description = "Minimum investment") @RequestParam(required = false) BigDecimal minInvestment,
            @Parameter(description = "Maximum investment") @RequestParam(required = false) BigDecimal maxInvestment,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Filtering franchises by investment range: {} - {} with pagination: {}", 
                minInvestment, maxInvestment, pageable);
        
        if (minInvestment != null && maxInvestment != null && minInvestment.compareTo(maxInvestment) > 0) {
            throw new BadRequestException("Minimum investment cannot be greater than maximum investment");
        }
        
        Page<Franchise> franchises = franchiseService.filterFranchisesByInvestmentRange(
                minInvestment, maxInvestment, pageable);
        return ResponseEntity.ok(franchises);
    }

    @Operation(summary = "Create franchise", description = "Create a new franchise (Business owners only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Franchise created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid franchise data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business role required")
    })
    @PostMapping
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Franchise> createFranchise(
            @Valid @RequestBody FranchiseDto.CreateFranchiseRequest request,
            Authentication authentication) {
        log.info("Creating franchise: {} by user: {}", request.getName(), authentication.getName());

        // Get user ID from email
        User currentUser = userService.getUserByEmail(authentication.getName());

        // Convert DTO to entity
        Franchise franchise = mapToFranchise(request);

        Franchise createdFranchise = franchiseService.createFranchise(franchise, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFranchise);
    }

    @Operation(summary = "Update franchise", description = "Update an existing franchise (Owner only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Franchise updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid franchise data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Owner only"),
        @ApiResponse(responseCode = "404", description = "Franchise not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Franchise> updateFranchise(
            @Parameter(description = "Franchise ID") @PathVariable String id,
            @Valid @RequestBody FranchiseDto.UpdateFranchiseRequest request,
            Authentication authentication) {
        log.info("Updating franchise: {} by user: {}", id, authentication.getName());
        
        // Convert DTO to entity
        Franchise franchise = mapToFranchise(request);
        
        Franchise updatedFranchise = franchiseService.updateFranchise(id, franchise, authentication.getName());
        return ResponseEntity.ok(updatedFranchise);
    }

    @Operation(summary = "Update franchise status", description = "Update franchise status (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Franchise status updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only"),
        @ApiResponse(responseCode = "404", description = "Franchise not found")
    })
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Franchise> updateFranchiseStatus(
            @Parameter(description = "Franchise ID") @PathVariable String id,
            @Parameter(description = "New status") @RequestParam Franchise.FranchiseStatus status) {
        log.info("Updating franchise status: {} to {}", id, status);
        
        Franchise updatedFranchise = franchiseService.updateFranchiseStatus(id, status);
        return ResponseEntity.ok(updatedFranchise);
    }

    @Operation(summary = "Delete franchise", description = "Delete a franchise (Owner only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Franchise deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Owner only"),
        @ApiResponse(responseCode = "404", description = "Franchise not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS')")
    public ResponseEntity<Void> deleteFranchise(
            @Parameter(description = "Franchise ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Deleting franchise: {} by user: {}", id, authentication.getName());
        
        franchiseService.deleteFranchise(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get franchise statistics", description = "Get franchise statistics (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FranchiseService.FranchiseStats> getFranchiseStats() {
        log.info("Getting franchise statistics");
        FranchiseService.FranchiseStats stats = franchiseService.getFranchiseStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get franchise statistics by business owner", description = "Get franchise statistics for a business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/stats/business-owner/{businessOwnerId}")
    @PreAuthorize("hasRole('ADMIN') or #businessOwnerId == authentication.name")
    public ResponseEntity<FranchiseService.FranchiseStats> getFranchiseStatsByBusinessOwner(
            @Parameter(description = "Business Owner ID") @PathVariable String businessOwnerId) {
        log.info("Getting franchise statistics for business owner: {}", businessOwnerId);
        FranchiseService.FranchiseStats stats = franchiseService.getFranchiseStatsByBusinessOwner(businessOwnerId);
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get franchise performance metrics", description = "Get performance metrics for a specific franchise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved performance metrics"),
        @ApiResponse(responseCode = "404", description = "Franchise not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/{id}/performance")
    @PreAuthorize("hasRole('BUSINESS') or hasRole('ADMIN')")
    public ResponseEntity<FranchiseDto.PerformanceMetrics> getFranchisePerformanceMetrics(
            @Parameter(description = "Franchise ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Getting performance metrics for franchise: {} by user: {}", id, authentication.getName());

        Franchise franchise = franchiseService.getFranchiseById(id);

        // Verify ownership for business users (admins can access all)
        if (!authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            // Get user ID from email for comparison
            User currentUser = userService.getUserByEmail(authentication.getName());
            if (!franchise.getBusinessOwnerId().equals(currentUser.getId())) {
                throw new BadRequestException("You can only view performance metrics for your own franchises");
            }
        }

        // Generate performance metrics based on franchise data and applications
        FranchiseDto.PerformanceMetrics metrics = franchiseService.calculatePerformanceMetrics(id);
        return ResponseEntity.ok(metrics);
    }

    // Helper methods for DTO mapping
    private Franchise mapToFranchise(FranchiseDto.CreateFranchiseRequest request) {
        Franchise franchise = new Franchise();
        franchise.setName(request.getName());
        franchise.setDescription(request.getDescription());
        franchise.setCategory(request.getCategory());
        franchise.setLogo(request.getLogo());
        franchise.setYearEstablished(request.getYearEstablished());
        franchise.setTotalUnits(request.getTotalUnits());
        franchise.setFranchisedUnits(request.getFranchisedUnits());
        franchise.setCompanyOwnedUnits(request.getCompanyOwnedUnits());
        franchise.setFranchiseFee(request.getFranchiseFee());
        franchise.setRoyaltyFee(request.getRoyaltyFee());
        franchise.setMarketingFee(request.getMarketingFee());
        franchise.setLiquidCapitalRequired(request.getLiquidCapitalRequired());
        franchise.setNetWorthRequired(request.getNetWorthRequired());
        // Add more mapping as needed
        return franchise;
    }

    private Franchise mapToFranchise(FranchiseDto.UpdateFranchiseRequest request) {
        Franchise franchise = new Franchise();
        franchise.setName(request.getName());
        franchise.setDescription(request.getDescription());
        franchise.setCategory(request.getCategory());
        franchise.setLogo(request.getLogo());
        franchise.setYearEstablished(request.getYearEstablished());
        franchise.setTotalUnits(request.getTotalUnits());
        franchise.setFranchisedUnits(request.getFranchisedUnits());
        franchise.setCompanyOwnedUnits(request.getCompanyOwnedUnits());
        franchise.setFranchiseFee(request.getFranchiseFee());
        franchise.setRoyaltyFee(request.getRoyaltyFee());
        franchise.setMarketingFee(request.getMarketingFee());
        franchise.setLiquidCapitalRequired(request.getLiquidCapitalRequired());
        franchise.setNetWorthRequired(request.getNetWorthRequired());
        // Add more mapping as needed
        return franchise;
    }
}
