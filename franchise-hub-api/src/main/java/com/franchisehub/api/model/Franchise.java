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
import java.util.List;

@Entity
@Table(name = "franchises")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Franchise {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FranchiseCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FranchiseStatus status;

    @Column(nullable = false)
    private String businessOwnerId;

    @Column(nullable = false)
    private String businessOwnerName;

    private String logo;

    @ElementCollection
    @CollectionTable(name = "franchise_images", joinColumns = @JoinColumn(name = "franchise_id"))
    @Column(name = "image_url")
    private List<String> images;

    // Financial Information
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal franchiseFee;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal royaltyFee; // Percentage

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marketingFee; // Percentage

    @Embedded
    private InvestmentRange initialInvestment;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal liquidCapitalRequired;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal netWorthRequired;

    // Business Details
    @Column(nullable = false)
    private Integer yearEstablished;

    @Column(nullable = false)
    private Integer totalUnits;

    @Column(nullable = false)
    private Integer franchisedUnits;

    @Column(nullable = false)
    private Integer companyOwnedUnits;

    @Embedded
    private FranchiseRequirements requirements;

    // Location and Territory
    @ElementCollection
    @CollectionTable(name = "franchise_territories", joinColumns = @JoinColumn(name = "franchise_id"))
    @Column(name = "territory")
    private List<String> availableTerritories;

    @ElementCollection
    @CollectionTable(name = "franchise_states", joinColumns = @JoinColumn(name = "franchise_id"))
    @Column(name = "state")
    private List<String> availableStates;

    // Support and Training
    @Embedded
    private TrainingSupport trainingSupport;

    // Marketing and Operations
    @Embedded
    private MarketingSupport marketingSupport;

    // Performance Metrics
    @Embedded
    private PerformanceMetrics performanceMetrics;

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
    public static class InvestmentRange {
        @Column(precision = 15, scale = 2)
        private BigDecimal min;
        
        @Column(precision = 15, scale = 2)
        private BigDecimal max;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FranchiseRequirements {
        @Column(columnDefinition = "TEXT")
        private String experience;
        
        @Column(columnDefinition = "TEXT")
        private String education;
        
        private Integer creditScore;
        
        @ElementCollection
        @CollectionTable(name = "franchise_background_requirements", joinColumns = @JoinColumn(name = "franchise_id"))
        @Column(name = "background_requirement")
        private List<String> background;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrainingSupport {
        private Integer initialTrainingDays;
        private Boolean ongoingSupport;
        private String trainingLocation;
        private String supportDescription;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketingSupport {
        private Boolean nationalAdvertising;
        private Boolean localMarketingSupport;
        private Boolean digitalMarketing;
        private String marketingDescription;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceMetrics {
        @Column(precision = 5, scale = 2)
        private BigDecimal averageRevenue;
        
        @Column(precision = 5, scale = 2)
        private BigDecimal profitMargin;
        
        @Column(precision = 5, scale = 2)
        private BigDecimal growthRate;
        
        @Column(precision = 5, scale = 2)
        private BigDecimal satisfactionScore;
    }

    // Enums
    public enum FranchiseCategory {
        FOOD_BEVERAGE, RETAIL, SERVICES, HEALTH_FITNESS, EDUCATION, 
        AUTOMOTIVE, REAL_ESTATE, TECHNOLOGY, HOSPITALITY, OTHER
    }

    public enum FranchiseStatus {
        ACTIVE, INACTIVE, PENDING, SUSPENDED
    }
}
