package com.franchisehub.api.dto;

import com.franchisehub.api.model.Application;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ApplicationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateApplicationRequest {
        @NotBlank(message = "Franchise ID is required")
        private String franchiseId;
        
        @NotBlank(message = "Franchise name is required")
        private String franchiseName;
        
        @NotNull(message = "Application fee is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Application fee must be positive")
        private BigDecimal applicationFee;
        
        // Personal Information
        @NotBlank(message = "First name is required")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        private String lastName;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Phone is required")
        private String phone;
        
        private String dateOfBirth;
        private String ssn;
        
        // Address
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        
        // Emergency Contact
        private String emergencyContactName;
        private String emergencyContactPhone;
        
        // Financial Information
        @DecimalMin(value = "0.0", message = "Net worth must be non-negative")
        private BigDecimal netWorth;
        
        @DecimalMin(value = "0.0", message = "Liquid assets must be non-negative")
        private BigDecimal liquidAssets;
        
        @DecimalMin(value = "0.0", message = "Annual income must be non-negative")
        private BigDecimal annualIncome;
        
        @Min(value = 300, message = "Credit score must be at least 300")
        @Max(value = 850, message = "Credit score must be at most 850")
        private Integer creditScore;
        
        private Boolean hasDebt;
        private BigDecimal debtAmount;
        private String investmentSource;
        
        // Business Information
        private String preferredStreet;
        private String preferredCity;
        private String preferredState;
        private String preferredZipCode;
        private String preferredCountry;
        
        private List<String> preferredStates;
        private String timelineToOpen;
        private Boolean fullTimeCommitment;
        private Boolean hasPartners;
        private String partnerDetails;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateApplicationRequest {
        // Personal Information
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String dateOfBirth;
        private String ssn;
        
        // Address
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        
        // Emergency Contact
        private String emergencyContactName;
        private String emergencyContactPhone;
        
        // Financial Information
        @DecimalMin(value = "0.0", message = "Net worth must be non-negative")
        private BigDecimal netWorth;
        
        @DecimalMin(value = "0.0", message = "Liquid assets must be non-negative")
        private BigDecimal liquidAssets;
        
        @DecimalMin(value = "0.0", message = "Annual income must be non-negative")
        private BigDecimal annualIncome;
        
        @Min(value = 300, message = "Credit score must be at least 300")
        @Max(value = 850, message = "Credit score must be at most 850")
        private Integer creditScore;
        
        private Boolean hasDebt;
        private BigDecimal debtAmount;
        private String investmentSource;
        
        // Business Information
        private String preferredStreet;
        private String preferredCity;
        private String preferredState;
        private String preferredZipCode;
        private String preferredCountry;
        
        private List<String> preferredStates;
        private String timelineToOpen;
        private Boolean fullTimeCommitment;
        private Boolean hasPartners;
        private String partnerDetails;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadDocumentRequest {
        @NotBlank(message = "Document type is required")
        private String type;
        
        @NotBlank(message = "File name is required")
        private String fileName;
        
        @NotBlank(message = "File URL is required")
        private String fileUrl;
        
        @NotNull(message = "File size is required")
        @Min(value = 1, message = "File size must be positive")
        private Long fileSize;
        
        private String mimeType;
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationResponse {
        private String id;
        private String franchiseId;
        private String franchiseName;
        private String applicantId;
        private String applicantName;
        private String applicantEmail;
        private Application.ApplicationStatus status;
        private Application.PaymentStatus paymentStatus;
        private BigDecimal applicationFee;
        private LocalDateTime submittedAt;
        private LocalDateTime approvedAt;
        private LocalDateTime rejectedAt;
        private String rejectionReason;
        private String approvalComments;
        private String paymentTransactionId;
        private LocalDateTime paidAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean isActive;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationSummary {
        private String id;
        private String franchiseName;
        private String applicantName;
        private String applicantEmail;
        private Application.ApplicationStatus status;
        private Application.PaymentStatus paymentStatus;
        private BigDecimal applicationFee;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationStats {
        private long totalApplications;
        private long draftApplications;
        private long submittedApplications;
        private long underReviewApplications;
        private long approvedApplications;
        private long rejectedApplications;
        private long withdrawnApplications;
        private long paidApplications;
        private long pendingPaymentApplications;
        private BigDecimal totalApplicationFees;
        private BigDecimal totalPaidFees;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentResponse {
        private String id;
        private String applicationId;
        private String type;
        private String fileName;
        private String fileUrl;
        private Long fileSize;
        private String mimeType;
        private String description;
        private LocalDateTime uploadedAt;
        private Boolean isVerified;
        private String verificationComments;
    }
}
