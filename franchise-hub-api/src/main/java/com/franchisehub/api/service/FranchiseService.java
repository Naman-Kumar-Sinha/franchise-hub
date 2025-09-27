package com.franchisehub.api.service;

import com.franchisehub.api.dto.FranchiseDto;
import com.franchisehub.api.model.Franchise;
import com.franchisehub.api.model.User;
import com.franchisehub.api.repository.FranchiseRepository;
import com.franchisehub.api.repository.UserRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FranchiseService {

    private final FranchiseRepository franchiseRepository;
    private final UserRepository userRepository;

    /**
     * Get all franchises with pagination
     */
    @Transactional(readOnly = true)
    public Page<Franchise> getAllFranchises(Pageable pageable) {
        log.debug("Getting all franchises with pagination: {}", pageable);
        return franchiseRepository.findAll(pageable);
    }

    /**
     * Get all active franchises
     */
    @Transactional(readOnly = true)
    public List<Franchise> getAllActiveFranchises() {
        log.debug("Getting all active franchises");
        return franchiseRepository.findByStatus(Franchise.FranchiseStatus.ACTIVE);
    }

    /**
     * Get franchise by ID
     */
    @Transactional(readOnly = true)
    public Franchise getFranchiseById(String id) {
        log.debug("Getting franchise by ID: {}", id);
        return franchiseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Franchise not found with ID: " + id));
    }

    /**
     * Get franchises by business owner ID
     */
    @Transactional(readOnly = true)
    public List<Franchise> getFranchisesByBusinessOwnerId(String businessOwnerId) {
        log.debug("Getting franchises by business owner ID: {}", businessOwnerId);
        return franchiseRepository.findByBusinessOwnerId(businessOwnerId);
    }

    /**
     * Get franchises by business owner ID with pagination
     */
    @Transactional(readOnly = true)
    public Page<Franchise> getFranchisesByBusinessOwnerId(String businessOwnerId, Pageable pageable) {
        log.debug("Getting franchises by business owner ID: {} with pagination: {}", businessOwnerId, pageable);
        return franchiseRepository.findByBusinessOwnerId(businessOwnerId, pageable);
    }

    /**
     * Get franchises by category
     */
    @Transactional(readOnly = true)
    public List<Franchise> getFranchisesByCategory(Franchise.FranchiseCategory category) {
        log.debug("Getting franchises by category: {}", category);
        return franchiseRepository.findByCategory(category);
    }

    /**
     * Get franchises by category with pagination
     */
    @Transactional(readOnly = true)
    public Page<Franchise> getFranchisesByCategory(Franchise.FranchiseCategory category, Pageable pageable) {
        log.debug("Getting franchises by category: {} with pagination: {}", category, pageable);
        return franchiseRepository.findByCategory(category, pageable);
    }

    /**
     * Get franchises by status
     */
    @Transactional(readOnly = true)
    public List<Franchise> getFranchisesByStatus(Franchise.FranchiseStatus status) {
        log.debug("Getting franchises by status: {}", status);
        return franchiseRepository.findByStatus(status);
    }

    /**
     * Search franchises by name or description
     */
    @Transactional(readOnly = true)
    public Page<Franchise> searchFranchises(String searchTerm, Pageable pageable) {
        log.debug("Searching franchises with term: {} and pagination: {}", searchTerm, pageable);
        return franchiseRepository.searchFranchises(searchTerm, pageable);
    }

    /**
     * Filter franchises by investment range
     */
    @Transactional(readOnly = true)
    public Page<Franchise> filterFranchisesByInvestmentRange(
            java.math.BigDecimal minInvestment, 
            java.math.BigDecimal maxInvestment, 
            Pageable pageable) {
        log.debug("Filtering franchises by investment range: {} - {} with pagination: {}", 
                minInvestment, maxInvestment, pageable);
        return franchiseRepository.findByInvestmentRange(minInvestment, maxInvestment, pageable);
    }

    /**
     * Create a new franchise
     */
    public Franchise createFranchise(Franchise franchise, String businessOwnerId) {
        log.debug("Creating new franchise: {} for business owner: {}", franchise.getName(), businessOwnerId);
        
        // Validate business owner exists
        User businessOwner = userRepository.findById(businessOwnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Business owner not found with ID: " + businessOwnerId));
        
        if (businessOwner.getRole() != User.UserRole.BUSINESS) {
            throw new BadRequestException("User must have BUSINESS role to create franchises");
        }

        // Generate ID
        franchise.setId(java.util.UUID.randomUUID().toString());

        // Set business owner information
        franchise.setBusinessOwnerId(businessOwnerId);
        franchise.setBusinessOwnerName(businessOwner.getFirstName() + " " + businessOwner.getLastName());

        // Set timestamps
        franchise.setCreatedAt(LocalDateTime.now());
        franchise.setUpdatedAt(LocalDateTime.now());

        // Set default status if not provided
        if (franchise.getStatus() == null) {
            franchise.setStatus(Franchise.FranchiseStatus.ACTIVE);
        }

        Franchise savedFranchise = franchiseRepository.save(franchise);
        log.info("Created franchise with ID: {}", savedFranchise.getId());
        return savedFranchise;
    }

    /**
     * Update an existing franchise
     */
    public Franchise updateFranchise(String id, Franchise franchiseUpdate, String businessOwnerId) {
        log.debug("Updating franchise: {} by business owner: {}", id, businessOwnerId);
        
        Franchise existingFranchise = getFranchiseById(id);
        
        // Verify ownership
        if (!existingFranchise.getBusinessOwnerId().equals(businessOwnerId)) {
            throw new BadRequestException("You can only update your own franchises");
        }

        // Update fields (preserve certain system fields)
        existingFranchise.setName(franchiseUpdate.getName());
        existingFranchise.setDescription(franchiseUpdate.getDescription());
        existingFranchise.setCategory(franchiseUpdate.getCategory());
        existingFranchise.setLogo(franchiseUpdate.getLogo());
        existingFranchise.setYearEstablished(franchiseUpdate.getYearEstablished());
        existingFranchise.setTotalUnits(franchiseUpdate.getTotalUnits());
        existingFranchise.setFranchisedUnits(franchiseUpdate.getFranchisedUnits());
        existingFranchise.setCompanyOwnedUnits(franchiseUpdate.getCompanyOwnedUnits());
        existingFranchise.setFranchiseFee(franchiseUpdate.getFranchiseFee());
        existingFranchise.setRoyaltyFee(franchiseUpdate.getRoyaltyFee());
        existingFranchise.setMarketingFee(franchiseUpdate.getMarketingFee());
        existingFranchise.setInitialInvestment(franchiseUpdate.getInitialInvestment());
        existingFranchise.setLiquidCapitalRequired(franchiseUpdate.getLiquidCapitalRequired());
        existingFranchise.setNetWorthRequired(franchiseUpdate.getNetWorthRequired());
        existingFranchise.setRequirements(franchiseUpdate.getRequirements());
        existingFranchise.setTrainingSupport(franchiseUpdate.getTrainingSupport());
        existingFranchise.setMarketingSupport(franchiseUpdate.getMarketingSupport());
        existingFranchise.setPerformanceMetrics(franchiseUpdate.getPerformanceMetrics());
        existingFranchise.setAvailableStates(franchiseUpdate.getAvailableStates());
        existingFranchise.setAvailableTerritories(franchiseUpdate.getAvailableTerritories());
        existingFranchise.setImages(franchiseUpdate.getImages());
        existingFranchise.setUpdatedAt(LocalDateTime.now());

        Franchise savedFranchise = franchiseRepository.save(existingFranchise);
        log.info("Updated franchise with ID: {}", savedFranchise.getId());
        return savedFranchise;
    }

    /**
     * Update franchise status (admin only)
     */
    public Franchise updateFranchiseStatus(String id, Franchise.FranchiseStatus status) {
        log.debug("Updating franchise status: {} to {}", id, status);
        
        Franchise franchise = getFranchiseById(id);
        franchise.setStatus(status);
        franchise.setUpdatedAt(LocalDateTime.now());
        
        Franchise savedFranchise = franchiseRepository.save(franchise);
        log.info("Updated franchise status for ID: {} to {}", id, status);
        return savedFranchise;
    }

    /**
     * Delete a franchise (soft delete by setting status to INACTIVE)
     */
    public void deleteFranchise(String id, String businessOwnerId) {
        log.debug("Deleting franchise: {} by business owner: {}", id, businessOwnerId);
        
        Franchise franchise = getFranchiseById(id);
        
        // Verify ownership
        if (!franchise.getBusinessOwnerId().equals(businessOwnerId)) {
            throw new BadRequestException("You can only delete your own franchises");
        }

        // Soft delete by setting status to INACTIVE
        franchise.setStatus(Franchise.FranchiseStatus.INACTIVE);
        franchise.setUpdatedAt(LocalDateTime.now());
        
        franchiseRepository.save(franchise);
        log.info("Soft deleted franchise with ID: {}", id);
    }

    /**
     * Get franchise statistics
     */
    @Transactional(readOnly = true)
    public FranchiseStats getFranchiseStats() {
        log.debug("Getting franchise statistics");
        
        long totalFranchises = franchiseRepository.count();
        long activeFranchises = franchiseRepository.countByStatus(Franchise.FranchiseStatus.ACTIVE);
        long pendingFranchises = franchiseRepository.countByStatus(Franchise.FranchiseStatus.PENDING);
        
        return new FranchiseStats(totalFranchises, activeFranchises, pendingFranchises);
    }

    /**
     * Get franchise statistics by business owner
     */
    @Transactional(readOnly = true)
    public FranchiseStats getFranchiseStatsByBusinessOwner(String businessOwnerId) {
        log.debug("Getting franchise statistics for business owner: {}", businessOwnerId);
        
        long totalFranchises = franchiseRepository.countByBusinessOwnerId(businessOwnerId);
        long activeFranchises = franchiseRepository.countByBusinessOwnerIdAndStatus(businessOwnerId, Franchise.FranchiseStatus.ACTIVE);
        long pendingFranchises = franchiseRepository.countByBusinessOwnerIdAndStatus(businessOwnerId, Franchise.FranchiseStatus.PENDING);
        
        return new FranchiseStats(totalFranchises, activeFranchises, pendingFranchises);
    }

    /**
     * Get franchises created since a specific date
     */
    @Transactional(readOnly = true)
    public List<Franchise> getFranchisesCreatedSince(LocalDateTime since) {
        log.debug("Getting franchises created since: {}", since);
        return franchiseRepository.findFranchisesCreatedSince(since);
    }

    /**
     * Get recent franchises
     */
    @Transactional(readOnly = true)
    public List<Franchise> getRecentFranchises() {
        log.debug("Getting recent franchises");
        return franchiseRepository.findFranchisesCreatedSince(LocalDateTime.now().minusDays(7));
    }

    /**
     * Calculate performance metrics for a franchise
     */
    @Transactional(readOnly = true)
    public FranchiseDto.PerformanceMetrics calculatePerformanceMetrics(String franchiseId) {
        log.debug("Calculating performance metrics for franchise: {}", franchiseId);

        // Verify franchise exists
        Franchise franchise = getFranchiseById(franchiseId);

        // For now, generate mock performance metrics based on franchise data
        // In a real implementation, this would query applications, payments, and other data

        // Handle nullable fields with safe defaults
        int totalUnits = franchise.getTotalUnits() != null ? franchise.getTotalUnits() : 0;
        int franchisedUnits = franchise.getFranchisedUnits() != null ? franchise.getFranchisedUnits() : 0;
        int companyOwnedUnits = franchise.getCompanyOwnedUnits() != null ? franchise.getCompanyOwnedUnits() : 0;
        int yearEstablished = franchise.getYearEstablished();
        int franchiseAge = LocalDateTime.now().getYear() - yearEstablished;

        // Generate realistic mock metrics based on available data
        // If no unit data is available, use franchise age and fee as basis
        int baseMetric = Math.max(1, totalUnits > 0 ? totalUnits : franchiseAge);
        int totalApplications = Math.max(1, baseMetric * 2 + (int)(Math.random() * 10));
        int approvedApplications = Math.max(1, Math.max(franchisedUnits, baseMetric / 2) + (int)(Math.random() * 3));
        double conversionRate = totalApplications > 0 ? (double) approvedApplications / totalApplications * 100 : 0;

        // Calculate revenue based on franchise fee and units
        BigDecimal totalRevenue = franchise.getFranchiseFee()
            .multiply(BigDecimal.valueOf(approvedApplications))
            .add(BigDecimal.valueOf(Math.max(franchisedUnits, 1) * 50000)); // Mock ongoing revenue

        // Average time to partnership (mock: 30-90 days)
        int averageTimeToPartnership = 30 + (int)(Math.random() * 60);

        // Monthly growth rate (mock: 2-15%)
        double monthlyGrowth = 2.0 + (Math.random() * 13.0);

        // Active partnerships (use franchised units or a reasonable default)
        int activePartnerships = Math.max(franchisedUnits, 1);

        return new FranchiseDto.PerformanceMetrics(
            totalApplications,
            approvedApplications,
            Math.round(conversionRate * 100.0) / 100.0, // Round to 2 decimal places
            totalRevenue,
            averageTimeToPartnership,
            Math.round(monthlyGrowth * 100.0) / 100.0, // Round to 2 decimal places
            activePartnerships
        );
    }

    /**
     * Inner class for franchise statistics
     */
    public static class FranchiseStats {
        private final long total;
        private final long active;
        private final long pending;

        public FranchiseStats(long total, long active, long pending) {
            this.total = total;
            this.active = active;
            this.pending = pending;
        }

        public long getTotal() { return total; }
        public long getActive() { return active; }
        public long getPending() { return pending; }
        public long getInactive() { return total - active - pending; }
    }
}
