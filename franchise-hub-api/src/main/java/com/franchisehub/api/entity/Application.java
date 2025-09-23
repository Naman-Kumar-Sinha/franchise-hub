package com.franchisehub.api.entity;

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
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@EntityListeners(AuditingEntityListener.class)
public class Application {

    @Id
    private String id;

    @Column(nullable = false)
    private String franchiseId;

    @Column(nullable = false)
    private String franchiseName;

    @Column(nullable = false)
    private String applicantId;

    @Column(nullable = false)
    private String applicantName;

    @Column(nullable = false)
    private String applicantEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    // Personal Information
    @Embedded
    private PersonalInfo personalInfo;

    // Financial Information
    @Embedded
    private FinancialInfo financialInfo;

    // Business Information
    @Embedded
    private BusinessInfo businessInfo;

    // Additional Information
    @Column(columnDefinition = "TEXT")
    private String motivation;

    @Column(columnDefinition = "TEXT")
    private String questions;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ApplicationDocument> documents;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reference> references;

    // Payment Information
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal applicationFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    private String paymentTransactionId;

    private LocalDateTime paidAt;

    // Review Information
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Embedded Classes
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonalInfo {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String dateOfBirth;
        private String ssn;
        
        @Embedded
        @AttributeOverrides({
            @AttributeOverride(name = "street", column = @Column(name = "personal_street")),
            @AttributeOverride(name = "city", column = @Column(name = "personal_city")),
            @AttributeOverride(name = "state", column = @Column(name = "personal_state")),
            @AttributeOverride(name = "zipCode", column = @Column(name = "personal_zip_code")),
            @AttributeOverride(name = "country", column = @Column(name = "personal_country"))
        })
        private Address address;
        
        private String emergencyContactName;
        private String emergencyContactPhone;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialInfo {
        @Column(precision = 15, scale = 2)
        private BigDecimal netWorth;
        
        @Column(precision = 15, scale = 2)
        private BigDecimal liquidAssets;
        
        @Column(precision = 15, scale = 2)
        private BigDecimal annualIncome;
        
        private Integer creditScore;
        private Boolean hasDebt;
        
        @Column(precision = 15, scale = 2)
        private BigDecimal debtAmount;
        
        @Column(columnDefinition = "TEXT")
        private String investmentSource;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusinessInfo {
        @Embedded
        @AttributeOverrides({
            @AttributeOverride(name = "street", column = @Column(name = "preferred_street")),
            @AttributeOverride(name = "city", column = @Column(name = "preferred_city")),
            @AttributeOverride(name = "state", column = @Column(name = "preferred_state")),
            @AttributeOverride(name = "zipCode", column = @Column(name = "preferred_zip_code")),
            @AttributeOverride(name = "country", column = @Column(name = "preferred_country"))
        })
        private Address preferredLocation;
        
        @ElementCollection
        @CollectionTable(name = "application_preferred_states", joinColumns = @JoinColumn(name = "application_id"))
        @Column(name = "state")
        private List<String> preferredStates;
        
        private String timelineToOpen;
        private Boolean fullTimeCommitment;
        private Boolean hasPartners;
        
        @Column(columnDefinition = "TEXT")
        private String partnerDetails;
    }

    // Enums
    public enum ApplicationStatus {
        DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, WITHDRAWN
    }

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }
}
