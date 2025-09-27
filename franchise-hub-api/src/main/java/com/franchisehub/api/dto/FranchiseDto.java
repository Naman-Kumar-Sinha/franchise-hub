package com.franchisehub.api.dto;

import com.franchisehub.api.model.Franchise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class FranchiseDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FranchiseResponse {
        private String id;
        private String name;
        private String description;
        private Franchise.FranchiseCategory category;
        private Franchise.FranchiseStatus status;
        private String businessOwnerId;
        private String businessOwnerName;
        private String logo;
        private List<String> images;
        
        // Financial Information
        private BigDecimal franchiseFee;
        private BigDecimal royaltyFee;
        private BigDecimal marketingFee;
        private Franchise.InvestmentRange initialInvestment;
        private BigDecimal liquidCapitalRequired;
        private BigDecimal netWorthRequired;
        
        // Business Details
        private Integer yearEstablished;
        private Integer totalUnits;
        private Integer franchisedUnits;
        private Integer companyOwnedUnits;
        
        private Franchise.FranchiseRequirements requirements;
        private List<String> availableTerritories;
        private List<String> availableStates;
        private Franchise.TrainingSupport trainingSupport;
        private Franchise.MarketingSupport marketingSupport;
        private Franchise.PerformanceMetrics performanceMetrics;
        
        private String createdAt;
        private String updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFranchiseRequest {
        @NotBlank(message = "Franchise name is required")
        private String name;

        @NotBlank(message = "Description is required")
        private String description;

        @NotNull(message = "Category is required")
        private Franchise.FranchiseCategory category;

        private String logo;
        private List<String> images;

        // Financial Information
        @NotNull(message = "Franchise fee is required")
        @Positive(message = "Franchise fee must be positive")
        private BigDecimal franchiseFee;

        @NotNull(message = "Royalty fee is required")
        @Positive(message = "Royalty fee must be positive")
        private BigDecimal royaltyFee;

        @NotNull(message = "Marketing fee is required")
        @Positive(message = "Marketing fee must be positive")
        private BigDecimal marketingFee;

        // Optional: Initial investment range
        private Franchise.InvestmentRange initialInvestment;

        @NotNull(message = "Liquid capital required is required")
        @Positive(message = "Liquid capital required must be positive")
        private BigDecimal liquidCapitalRequired;

        @NotNull(message = "Net worth required is required")
        @Positive(message = "Net worth required must be positive")
        private BigDecimal netWorthRequired;

        // Business Details
        @NotNull(message = "Year established is required")
        private Integer yearEstablished;

        // Optional: Business unit details
        private Integer totalUnits;

        private Integer franchisedUnits;

        private Integer companyOwnedUnits;

        private Franchise.FranchiseRequirements requirements;
        private List<String> availableTerritories;
        private List<String> availableStates;
        private Franchise.TrainingSupport trainingSupport;
        private Franchise.MarketingSupport marketingSupport;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateFranchiseRequest {
        private String name;
        private String description;
        private Franchise.FranchiseCategory category;
        private Franchise.FranchiseStatus status;
        private String logo;
        private List<String> images;
        
        // Financial Information
        private BigDecimal franchiseFee;
        private BigDecimal royaltyFee;
        private BigDecimal marketingFee;
        private Franchise.InvestmentRange initialInvestment;
        private BigDecimal liquidCapitalRequired;
        private BigDecimal netWorthRequired;
        
        // Business Details
        private Integer yearEstablished;
        private Integer totalUnits;
        private Integer franchisedUnits;
        private Integer companyOwnedUnits;
        
        private Franchise.FranchiseRequirements requirements;
        private List<String> availableTerritories;
        private List<String> availableStates;
        private Franchise.TrainingSupport trainingSupport;
        private Franchise.MarketingSupport marketingSupport;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FranchiseFilterRequest {
        private Franchise.FranchiseCategory category;
        private BigDecimal minInvestment;
        private BigDecimal maxInvestment;
        private BigDecimal minFee;
        private BigDecimal maxFee;
        private String search;
        private List<String> states;
        private Integer page = 0;
        private Integer size = 10;
        private String sortBy = "createdAt";
        private String sortDirection = "DESC";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkUpdateRequest {
        @NotNull(message = "Franchise IDs are required")
        private List<String> franchiseIds;

        private Franchise.FranchiseStatus status;
        private Franchise.FranchiseCategory category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        private Integer totalApplications;
        private Integer approvedApplications;
        private Double conversionRate;
        private BigDecimal totalRevenue;
        private Integer averageTimeToPartnership;
        private Double monthlyGrowth;
        private Integer activePartnerships;
    }
}
