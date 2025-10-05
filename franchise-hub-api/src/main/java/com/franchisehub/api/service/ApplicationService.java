package com.franchisehub.api.service;

import com.franchisehub.api.model.Application;
import com.franchisehub.api.model.ApplicationDocument;
import com.franchisehub.api.model.Franchise;
import com.franchisehub.api.model.User;
import com.franchisehub.api.repository.ApplicationRepository;
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
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final FranchiseRepository franchiseRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Get all applications with pagination
     */
    @Transactional(readOnly = true)
    public Page<Application> getAllApplications(Pageable pageable) {
        log.debug("Getting all applications with pagination: {}", pageable);
        return applicationRepository.findAll(pageable);
    }

    /**
     * Get application by ID
     */
    @Transactional(readOnly = true)
    public Application getApplicationById(String id) {
        log.debug("Getting application by ID: {}", id);
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with ID: " + id));
    }

    /**
     * Get applications by applicant ID
     */
    @Transactional(readOnly = true)
    public List<Application> getApplicationsByApplicantId(String applicantId) {
        log.debug("Getting applications by applicant ID: {}", applicantId);
        return applicationRepository.findByApplicantId(applicantId);
    }

    /**
     * Get applications by applicant ID with pagination
     */
    @Transactional(readOnly = true)
    public Page<Application> getApplicationsByApplicantId(String applicantId, Pageable pageable) {
        log.debug("Getting applications by applicant ID: {} with pagination: {}", applicantId, pageable);
        return applicationRepository.findByApplicantId(applicantId, pageable);
    }

    /**
     * Get applications by franchise ID
     */
    @Transactional(readOnly = true)
    public List<Application> getApplicationsByFranchiseId(String franchiseId) {
        log.debug("Getting applications by franchise ID: {}", franchiseId);
        return applicationRepository.findByFranchiseId(franchiseId);
    }

    /**
     * Get applications by franchise ID with pagination
     */
    @Transactional(readOnly = true)
    public Page<Application> getApplicationsByFranchiseId(String franchiseId, Pageable pageable) {
        log.debug("Getting applications by franchise ID: {} with pagination: {}", franchiseId, pageable);
        return applicationRepository.findByFranchiseId(franchiseId, pageable);
    }

    /**
     * Get applications by status
     */
    @Transactional(readOnly = true)
    public List<Application> getApplicationsByStatus(Application.ApplicationStatus status) {
        log.debug("Getting applications by status: {}", status);
        return applicationRepository.findByStatus(status);
    }

    /**
     * Get applications by status with pagination
     */
    @Transactional(readOnly = true)
    public Page<Application> getApplicationsByStatus(Application.ApplicationStatus status, Pageable pageable) {
        log.debug("Getting applications by status: {} with pagination: {}", status, pageable);
        return applicationRepository.findByStatus(status, pageable);
    }

    /**
     * Get applications for business owner's franchises
     * @param businessOwnerIdentifier Can be either email or UUID
     */
    @Transactional(readOnly = true)
    public Page<Application> getApplicationsForBusinessOwner(String businessOwnerIdentifier, Pageable pageable) {
        log.debug("Getting applications for business owner: {} with pagination: {}", businessOwnerIdentifier, pageable);

        // If the identifier looks like an email, resolve it to UUID
        String businessOwnerId = businessOwnerIdentifier;
        if (businessOwnerIdentifier.contains("@")) {
            User user = userService.getUserByEmail(businessOwnerIdentifier);
            businessOwnerId = user.getId();
            log.debug("Resolved email {} to UUID {}", businessOwnerIdentifier, businessOwnerId);
        }

        return applicationRepository.findApplicationsForBusinessOwner(businessOwnerId, pageable);
    }

    /**
     * Create a new application
     */
    public Application createApplication(Application application, String applicantId, String franchiseId) {
        log.debug("Creating new application for franchise: {} by applicant: {}", franchiseId, applicantId);

        // Find or create applicant user
        User applicant = findOrCreateUser(applicantId, application);
        
        if (applicant.getRole() != User.UserRole.PARTNER) {
            throw new BadRequestException("User must have PARTNER role to submit applications");
        }

        // Validate franchise exists and is active
        Franchise franchise = franchiseRepository.findById(franchiseId)
                .orElseThrow(() -> new ResourceNotFoundException("Franchise not found with ID: " + franchiseId));
        
        if (franchise.getStatus() != Franchise.FranchiseStatus.ACTIVE) {
            throw new BadRequestException("Cannot apply to inactive franchise");
        }

        // Check for existing active application
        List<Application> existingApplications = applicationRepository.findByApplicantIdAndFranchiseIdAndIsActiveTrue(
                applicantId, franchiseId);
        if (!existingApplications.isEmpty()) {
            throw new BadRequestException("You already have an active application for this franchise");
        }

        // Set application details
        application.setId(java.util.UUID.randomUUID().toString());
        application.setApplicantId(applicant.getId()); // Use User's UUID instead of email
        application.setApplicantName(applicant.getFirstName() + " " + applicant.getLastName());
        application.setApplicantEmail(applicant.getEmail());
        application.setFranchiseId(franchiseId);
        application.setFranchiseName(franchise.getName());
        application.setSubmittedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());
        application.setIsActive(true);
        
        // Set default status and payment status
        // Applications are submitted directly, so they start as UNDER_REVIEW
        if (application.getStatus() == null) {
            application.setStatus(Application.ApplicationStatus.UNDER_REVIEW);
        }
        if (application.getPaymentStatus() == null) {
            application.setPaymentStatus(Application.PaymentStatus.PENDING);
        }
        
        // Set application fee (could be from franchise or system default)
        if (application.getApplicationFee() == null) {
            application.setApplicationFee(new BigDecimal("5000.00")); // Default application fee
        }

        // Initialize empty collections if null
        if (application.getDocuments() == null) {
            application.setDocuments(new ArrayList<>());
        }
        if (application.getReferences() == null) {
            application.setReferences(new ArrayList<>());
        }
        if (application.getBusinessInfo() == null) {
            application.setBusinessInfo(new Application.BusinessInfo());
        }
        if (application.getBusinessInfo().getPreferredStates() == null) {
            application.getBusinessInfo().setPreferredStates(new ArrayList<>());
        }

        Application savedApplication = applicationRepository.save(application);
        log.info("Created application with ID: {}", savedApplication.getId());
        return savedApplication;
    }

    /**
     * Update an existing application
     */
    public Application updateApplication(String id, Application applicationUpdate, String applicantId) {
        log.debug("Updating application: {} by applicant: {}", id, applicantId);
        
        Application existingApplication = getApplicationById(id);
        
        // Verify ownership
        if (!existingApplication.getApplicantId().equals(applicantId)) {
            throw new BadRequestException("You can only update your own applications");
        }

        // Check if application can be updated
        if (existingApplication.getStatus() == Application.ApplicationStatus.APPROVED ||
            existingApplication.getStatus() == Application.ApplicationStatus.REJECTED) {
            throw new BadRequestException("Cannot update approved or rejected applications");
        }

        // Update fields
        if (applicationUpdate.getPersonalInfo() != null) {
            existingApplication.setPersonalInfo(applicationUpdate.getPersonalInfo());
        }
        if (applicationUpdate.getFinancialInfo() != null) {
            existingApplication.setFinancialInfo(applicationUpdate.getFinancialInfo());
        }
        if (applicationUpdate.getBusinessInfo() != null) {
            existingApplication.setBusinessInfo(applicationUpdate.getBusinessInfo());
        }
        if (applicationUpdate.getPersonalInfo() != null && applicationUpdate.getPersonalInfo().getAddress() != null) {
            if (existingApplication.getPersonalInfo() == null) {
                existingApplication.setPersonalInfo(new Application.PersonalInfo());
            }
            existingApplication.getPersonalInfo().setAddress(applicationUpdate.getPersonalInfo().getAddress());
        }
        if (applicationUpdate.getBusinessInfo() != null && applicationUpdate.getBusinessInfo().getPreferredLocation() != null) {
            if (existingApplication.getBusinessInfo() == null) {
                existingApplication.setBusinessInfo(new Application.BusinessInfo());
            }
            existingApplication.getBusinessInfo().setPreferredLocation(applicationUpdate.getBusinessInfo().getPreferredLocation());
        }
        if (applicationUpdate.getBusinessInfo() != null && applicationUpdate.getBusinessInfo().getPreferredStates() != null) {
            if (existingApplication.getBusinessInfo() == null) {
                existingApplication.setBusinessInfo(new Application.BusinessInfo());
            }
            existingApplication.getBusinessInfo().setPreferredStates(applicationUpdate.getBusinessInfo().getPreferredStates());
        }
        if (applicationUpdate.getReferences() != null) {
            existingApplication.setReferences(applicationUpdate.getReferences());
        }
        
        existingApplication.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(existingApplication);
        log.info("Updated application with ID: {}", savedApplication.getId());
        return savedApplication;
    }

    /**
     * Submit application for review
     */
    public Application submitApplication(String id, String applicantId) {
        log.debug("Submitting application: {} by applicant: {}", id, applicantId);
        
        Application application = getApplicationById(id);
        
        // Verify ownership
        if (!application.getApplicantId().equals(applicantId)) {
            throw new BadRequestException("You can only submit your own applications");
        }

        // Check current status - applications are already UNDER_REVIEW when created
        if (application.getStatus() != Application.ApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Application is not in a submittable state");
        }

        // Validate required information
        validateApplicationForSubmission(application);

        // Status remains UNDER_REVIEW (no change needed as applications start in this state)
        application.setSubmittedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        log.info("Submitted application with ID: {}", savedApplication.getId());
        return savedApplication;
    }

    /**
     * Review application (business owner or admin)
     */
    public Application reviewApplication(String id, Application.ApplicationStatus newStatus, 
                                       String reviewNotes, String reviewerId) {
        log.debug("Reviewing application: {} with status: {} by reviewer: {}", id, newStatus, reviewerId);
        
        Application application = getApplicationById(id);
        
        // Validate reviewer permissions
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found with ID: " + reviewerId));
        
        if (reviewer.getRole() == User.UserRole.PARTNER) {
            throw new BadRequestException("Partners cannot review applications");
        }

        // For business owners, verify they own the franchise
        if (reviewer.getRole() == User.UserRole.BUSINESS) {
            Franchise franchise = franchiseRepository.findById(application.getFranchiseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Franchise not found"));
            
            if (!franchise.getBusinessOwnerId().equals(reviewerId)) {
                throw new BadRequestException("You can only review applications for your own franchises");
            }
        }

        // Validate status transition
        if (application.getStatus() != Application.ApplicationStatus.SUBMITTED &&
            application.getStatus() != Application.ApplicationStatus.UNDER_REVIEW) {
            throw new BadRequestException("Can only review submitted or under-review applications");
        }

        // Update application
        application.setStatus(newStatus);
        application.setReviewNotes(reviewNotes);
        application.setReviewedBy(reviewerId);
        application.setReviewedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        log.info("Reviewed application with ID: {} - new status: {}", savedApplication.getId(), newStatus);
        return savedApplication;
    }

    /**
     * Withdraw application
     */
    public Application withdrawApplication(String id, String applicantId) {
        log.debug("Withdrawing application: {} by applicant: {}", id, applicantId);
        
        Application application = getApplicationById(id);
        
        // Verify ownership
        if (!application.getApplicantId().equals(applicantId)) {
            throw new BadRequestException("You can only withdraw your own applications");
        }

        // Check if withdrawal is allowed
        if (application.getStatus() == Application.ApplicationStatus.APPROVED ||
            application.getStatus() == Application.ApplicationStatus.WITHDRAWN) {
            throw new BadRequestException("Cannot withdraw approved or already withdrawn applications");
        }

        // Update status
        application.setStatus(Application.ApplicationStatus.WITHDRAWN);
        application.setIsActive(false);
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        log.info("Withdrew application with ID: {}", savedApplication.getId());
        return savedApplication;
    }

    /**
     * Get application statistics
     */
    @Transactional(readOnly = true)
    public ApplicationStats getApplicationStats() {
        log.debug("Getting application statistics");
        
        long totalApplications = applicationRepository.count();
        long submittedApplications = applicationRepository.countByStatus(Application.ApplicationStatus.SUBMITTED);
        long underReviewApplications = applicationRepository.countByStatus(Application.ApplicationStatus.UNDER_REVIEW);
        long approvedApplications = applicationRepository.countByStatus(Application.ApplicationStatus.APPROVED);
        long rejectedApplications = applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED);
        
        return new ApplicationStats(totalApplications, submittedApplications, underReviewApplications, 
                                  approvedApplications, rejectedApplications);
    }

    /**
     * Get application statistics by franchise
     */
    @Transactional(readOnly = true)
    public ApplicationStats getApplicationStatsByFranchise(String franchiseId) {
        log.debug("Getting application statistics for franchise: {}", franchiseId);

        long totalApplications = applicationRepository.countByFranchiseId(franchiseId);
        long submittedApplications = applicationRepository.countByFranchiseIdAndStatus(franchiseId, Application.ApplicationStatus.SUBMITTED);
        long underReviewApplications = applicationRepository.countByFranchiseIdAndStatus(franchiseId, Application.ApplicationStatus.UNDER_REVIEW);
        long approvedApplications = applicationRepository.countByFranchiseIdAndStatus(franchiseId, Application.ApplicationStatus.APPROVED);
        long rejectedApplications = applicationRepository.countByFranchiseIdAndStatus(franchiseId, Application.ApplicationStatus.REJECTED);

        return new ApplicationStats(totalApplications, submittedApplications, underReviewApplications,
                                  approvedApplications, rejectedApplications);
    }

    /**
     * Get application statistics by business owner
     */
    @Transactional(readOnly = true)
    public ApplicationStats getApplicationStatsByBusinessOwner(String businessOwnerId) {
        log.debug("Getting application statistics for business owner: {}", businessOwnerId);

        long totalApplications = applicationRepository.countApplicationsForBusinessOwner(businessOwnerId);
        long submittedApplications = applicationRepository.countApplicationsForBusinessOwnerByStatus(businessOwnerId, Application.ApplicationStatus.SUBMITTED);
        long underReviewApplications = applicationRepository.countApplicationsForBusinessOwnerByStatus(businessOwnerId, Application.ApplicationStatus.UNDER_REVIEW);
        long approvedApplications = applicationRepository.countApplicationsForBusinessOwnerByStatus(businessOwnerId, Application.ApplicationStatus.APPROVED);
        long rejectedApplications = applicationRepository.countApplicationsForBusinessOwnerByStatus(businessOwnerId, Application.ApplicationStatus.REJECTED);

        return new ApplicationStats(totalApplications, submittedApplications, underReviewApplications,
                                  approvedApplications, rejectedApplications);
    }

    /**
     * Validate application for submission
     */
    private void validateApplicationForSubmission(Application application) {
        if (application.getPersonalInfo() == null) {
            throw new BadRequestException("Personal information is required");
        }
        if (application.getFinancialInfo() == null) {
            throw new BadRequestException("Financial information is required");
        }
        if (application.getPersonalInfo() == null || application.getPersonalInfo().getAddress() == null) {
            throw new BadRequestException("Personal address is required");
        }
        if (application.getBusinessInfo() == null || application.getBusinessInfo().getPreferredLocation() == null) {
            throw new BadRequestException("Preferred location is required");
        }
        // Add more validation as needed
    }

    /**
     * Get applications by applicant ID and status
     */
    @Transactional(readOnly = true)
    public Page<Application> getApplicationsByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status, Pageable pageable) {
        log.debug("Getting applications by applicant ID: {} and status: {} with pagination: {}", applicantId, status, pageable);
        return applicationRepository.findByApplicantIdAndStatus(applicantId, status, pageable);
    }

    /**
     * Approve application
     */
    @Transactional
    public Application approveApplication(String id, String approvalComments, String reviewerId) {
        log.debug("Approving application: {} by reviewer: {}", id, reviewerId);

        Application application = getApplicationById(id);

        // Verify reviewer permissions (business owner or admin)
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        if (reviewer.getRole() != User.UserRole.ADMIN && reviewer.getRole() != User.UserRole.BUSINESS) {
            throw new BadRequestException("Only admins and business owners can approve applications");
        }

        // For business owners, verify they own the franchise
        if (reviewer.getRole() == User.UserRole.BUSINESS) {
            Franchise franchise = franchiseRepository.findById(application.getFranchiseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Franchise not found"));

            if (!franchise.getBusinessOwnerId().equals(reviewerId)) {
                throw new BadRequestException("You can only approve applications for your own franchises");
            }
        }

        application.setStatus(Application.ApplicationStatus.APPROVED);
        application.setReviewNotes(approvalComments);
        application.setReviewedBy(reviewerId);
        application.setReviewedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        log.info("Approved application with ID: {}", id);
        return savedApplication;
    }

    /**
     * Reject application
     */
    @Transactional
    public Application rejectApplication(String id, String rejectionReason, String reviewerId) {
        log.debug("Rejecting application: {} by reviewer: {}", id, reviewerId);

        Application application = getApplicationById(id);

        // Verify reviewer permissions (business owner or admin)
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));

        if (reviewer.getRole() != User.UserRole.ADMIN && reviewer.getRole() != User.UserRole.BUSINESS) {
            throw new BadRequestException("Only admins and business owners can reject applications");
        }

        // For business owners, verify they own the franchise
        if (reviewer.getRole() == User.UserRole.BUSINESS) {
            Franchise franchise = franchiseRepository.findById(application.getFranchiseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Franchise not found"));

            if (!franchise.getBusinessOwnerId().equals(reviewerId)) {
                throw new BadRequestException("You can only reject applications for your own franchises");
            }
        }

        application.setStatus(Application.ApplicationStatus.REJECTED);
        application.setRejectionReason(rejectionReason);
        application.setReviewedBy(reviewerId);
        application.setReviewedAt(LocalDateTime.now());
        application.setUpdatedAt(LocalDateTime.now());

        Application savedApplication = applicationRepository.save(application);
        log.info("Rejected application with ID: {}", id);
        return savedApplication;
    }

    /**
     * Get application documents
     */
    @Transactional(readOnly = true)
    public List<ApplicationDocument> getApplicationDocuments(String applicationId) {
        log.debug("Getting documents for application: {}", applicationId);

        Application application = getApplicationById(applicationId);
        return application.getDocuments() != null ? application.getDocuments() : new ArrayList<>();
    }

    /**
     * Upload document
     */
    @Transactional
    public ApplicationDocument uploadDocument(String applicationId, ApplicationDocument document, String userId) {
        log.debug("Uploading document for application: {} by user: {}", applicationId, userId);

        Application application = getApplicationById(applicationId);

        // Verify ownership
        if (!application.getApplicantId().equals(userId)) {
            throw new BadRequestException("You can only upload documents for your own applications");
        }

        document.setApplication(application);
        document.setUploadedBy(userId);

        if (application.getDocuments() == null) {
            application.setDocuments(new ArrayList<>());
        }
        application.getDocuments().add(document);

        applicationRepository.save(application);
        log.info("Uploaded document for application: {}", applicationId);
        return document;
    }

    /**
     * Delete document
     */
    @Transactional
    public void deleteDocument(String applicationId, String documentId, String userId) {
        log.debug("Deleting document: {} from application: {} by user: {}", documentId, applicationId, userId);

        Application application = getApplicationById(applicationId);

        // Verify ownership
        if (!application.getApplicantId().equals(userId)) {
            throw new BadRequestException("You can only delete documents from your own applications");
        }

        if (application.getDocuments() != null) {
            application.getDocuments().removeIf(doc -> doc.getId().equals(documentId));
            applicationRepository.save(application);
        }

        log.info("Deleted document: {} from application: {}", documentId, applicationId);
    }

    /**
     * Get applications created since a specific date
     */
    @Transactional(readOnly = true)
    public List<Application> getApplicationsCreatedSince(LocalDateTime since) {
        log.debug("Getting applications created since: {}", since);
        return applicationRepository.findApplicationsCreatedSince(since);
    }

    /**
     * Get recent applications
     */
    @Transactional(readOnly = true)
    public List<Application> getRecentApplications() {
        log.debug("Getting recent applications");
        return applicationRepository.findApplicationsCreatedSince(LocalDateTime.now().minusDays(7));
    }

    /**
     * Inner class for application statistics
     */
    public static class ApplicationStats {
        private final long total;
        private final long submitted;
        private final long underReview;
        private final long approved;
        private final long rejected;

        public ApplicationStats(long total, long submitted, long underReview, long approved, long rejected) {
            this.total = total;
            this.submitted = submitted;
            this.underReview = underReview;
            this.approved = approved;
            this.rejected = rejected;
        }

        public long getTotal() { return total; }
        public long getSubmitted() { return submitted; }
        public long getUnderReview() { return underReview; }
        public long getApproved() { return approved; }
        public long getRejected() { return rejected; }
        public long getDraft() { return total - submitted - underReview - approved - rejected; }

        // Additional methods for business dashboard
        public long getTotalApplications() { return total; }
        public long getApprovedApplications() { return approved; }
        public long getPendingApplications() { return submitted + underReview; }
    }

    /**
     * Find existing user or create a new one for real accounts that don't have User records
     */
    private User findOrCreateUser(String applicantId, Application application) {
        // First try to find existing user by ID (for demo accounts)
        Optional<User> existingUser = userRepository.findById(applicantId);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // If not found by ID, try to find by email (applicantId is email for real accounts)
        Optional<User> userByEmail = userRepository.findByEmail(applicantId);
        if (userByEmail.isPresent()) {
            return userByEmail.get();
        }

        // Create new user for real accounts that don't have User records
        log.info("Creating new User record for real account: {}", applicantId);
        User newUser = new User();
        newUser.setId(java.util.UUID.randomUUID().toString());
        newUser.setEmail(applicantId);

        // Use application data to populate user fields
        Application.PersonalInfo personalInfo = application.getPersonalInfo();
        if (personalInfo != null) {
            newUser.setFirstName(personalInfo.getFirstName() != null ? personalInfo.getFirstName() : "Unknown");
            newUser.setLastName(personalInfo.getLastName() != null ? personalInfo.getLastName() : "User");
            newUser.setPhone(personalInfo.getPhone() != null ? personalInfo.getPhone() : "");
        } else {
            newUser.setFirstName("Unknown");
            newUser.setLastName("User");
            newUser.setPhone("");
        }
        newUser.setRole(User.UserRole.PARTNER); // Default to PARTNER for application submissions
        newUser.setPassword(""); // No password for JWT-authenticated users
        newUser.setIsActive(true);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        newUser.setUpdatedAt(java.time.LocalDateTime.now());

        // Set default preferences
        User.UserPreferences preferences = new User.UserPreferences();
        preferences.setNotifications(new User.UserPreferences.NotificationSettings(true, false, false));
        preferences.setTheme(User.UserPreferences.Theme.LIGHT);
        preferences.setLanguage("en");
        preferences.setTimezone("UTC");
        newUser.setPreferences(preferences);

        return userRepository.save(newUser);
    }

    /**
     * Check if the user is the owner of the application (applicant)
     */
    @Transactional(readOnly = true)
    public boolean isApplicationOwner(String applicationId, String userEmail) {
        log.debug("Checking if user {} is owner of application {}", userEmail, applicationId);

        try {
            Application application = getApplicationById(applicationId);

            // Resolve email to UUID if needed
            User user = userService.getUserByEmail(userEmail);

            boolean isOwner = application.getApplicantId().equals(user.getId());
            log.debug("User {} is owner of application {}: {}", userEmail, applicationId, isOwner);
            return isOwner;
        } catch (Exception e) {
            log.warn("Error checking application ownership for user {} and application {}: {}",
                    userEmail, applicationId, e.getMessage());
            return false;
        }
    }

    /**
     * Check if the user is the business owner of the franchise that the application is for
     */
    @Transactional(readOnly = true)
    public boolean isApplicationBusinessOwner(String applicationId, String userEmail) {
        log.debug("Checking if user {} is business owner for application {}", userEmail, applicationId);

        try {
            Application application = getApplicationById(applicationId);

            // Get the franchise for this application
            Franchise franchise = franchiseRepository.findById(application.getFranchiseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Franchise not found"));

            // Resolve email to UUID if needed
            User user = userService.getUserByEmail(userEmail);

            boolean isBusinessOwner = franchise.getBusinessOwnerId().equals(user.getId());
            log.debug("User {} is business owner for application {}: {}", userEmail, applicationId, isBusinessOwner);
            return isBusinessOwner;
        } catch (Exception e) {
            log.warn("Error checking business ownership for user {} and application {}: {}",
                    userEmail, applicationId, e.getMessage());
            return false;
        }
    }
}
