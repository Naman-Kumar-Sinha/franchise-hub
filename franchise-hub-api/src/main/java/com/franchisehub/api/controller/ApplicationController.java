package com.franchisehub.api.controller;

import com.franchisehub.api.model.Application;
import com.franchisehub.api.model.ApplicationDocument;
import com.franchisehub.api.service.ApplicationService;
import com.franchisehub.api.dto.ApplicationDto;
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

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Application Management", description = "APIs for managing franchise applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Get all applications", description = "Retrieve all applications with pagination (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved applications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Application>> getAllApplications(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting all applications with pagination: {}", pageable);
        Page<Application> applications = applicationService.getAllApplications(pageable);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "Get application by ID", description = "Retrieve a specific application by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved application"),
        @ApiResponse(responseCode = "404", description = "Application not found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @applicationService.isApplicationOwner(#id, authentication.name) or @applicationService.isApplicationBusinessOwner(#id, authentication.name)")
    public ResponseEntity<Application> getApplicationById(
            @Parameter(description = "Application ID") @PathVariable String id) {
        log.info("Getting application by ID: {}", id);
        Application application = applicationService.getApplicationById(id);
        return ResponseEntity.ok(application);
    }

    @Operation(summary = "Get applications by applicant", description = "Retrieve applications by applicant ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved applications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/applicant/{applicantId}")
    @PreAuthorize("hasRole('ADMIN') or #applicantId == authentication.name")
    public ResponseEntity<Page<Application>> getApplicationsByApplicant(
            @Parameter(description = "Applicant ID") @PathVariable String applicantId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting applications by applicant: {} with pagination: {}", applicantId, pageable);
        Page<Application> applications = applicationService.getApplicationsByApplicantId(applicantId, pageable);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "Get applications by franchise", description = "Retrieve applications for a specific franchise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved applications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/franchise/{franchiseId}")
    @PreAuthorize("hasRole('ADMIN') or @franchiseService.isFranchiseOwner(#franchiseId, authentication.name)")
    public ResponseEntity<Page<Application>> getApplicationsByFranchise(
            @Parameter(description = "Franchise ID") @PathVariable String franchiseId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting applications by franchise: {} with pagination: {}", franchiseId, pageable);
        Page<Application> applications = applicationService.getApplicationsByFranchiseId(franchiseId, pageable);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "Get applications by status", description = "Retrieve applications by status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved applications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<Application>> getApplicationsByStatus(
            @Parameter(description = "Application Status") @PathVariable Application.ApplicationStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("Getting applications by status: {} with pagination: {}", status, pageable);
        
        // Filter by user role
        Page<Application> applications;
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            applications = applicationService.getApplicationsByStatus(status, pageable);
        } else {
            applications = applicationService.getApplicationsByApplicantIdAndStatus(authentication.getName(), status, pageable);
        }
        
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "Get applications for business owner", description = "Retrieve applications for franchises owned by business owner")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved applications"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/business-owner/{businessOwnerId}")
    @PreAuthorize("hasRole('ADMIN') or #businessOwnerId == authentication.name")
    public ResponseEntity<Page<Application>> getApplicationsForBusinessOwner(
            @Parameter(description = "Business Owner ID") @PathVariable String businessOwnerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Getting applications for business owner: {} with pagination: {}", businessOwnerId, pageable);
        Page<Application> applications = applicationService.getApplicationsForBusinessOwner(businessOwnerId, pageable);
        return ResponseEntity.ok(applications);
    }

    @Operation(summary = "Create application", description = "Create a new franchise application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Application created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid application data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "409", description = "Duplicate application")
    })
    @PostMapping
    public ResponseEntity<Application> createApplication(
            @Valid @RequestBody ApplicationDto.CreateApplicationRequest request,
            Authentication authentication) {
        log.info("Creating application for franchise: {} by user: {}", request.getFranchiseId(), authentication.getName());
        
        // Convert DTO to entity
        Application application = mapToApplication(request);

        Application createdApplication = applicationService.createApplication(application, authentication.getName(), request.getFranchiseId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @Operation(summary = "Update application", description = "Update an existing application (Applicant only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid application data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Applicant only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PutMapping("/{id}")
    @PreAuthorize("@applicationService.isApplicationOwner(#id, authentication.name)")
    public ResponseEntity<Application> updateApplication(
            @Parameter(description = "Application ID") @PathVariable String id,
            @Valid @RequestBody ApplicationDto.UpdateApplicationRequest request,
            Authentication authentication) {
        log.info("Updating application: {} by user: {}", id, authentication.getName());
        
        // Convert DTO to entity
        Application application = mapToApplication(request);
        
        Application updatedApplication = applicationService.updateApplication(id, application, authentication.getName());
        return ResponseEntity.ok(updatedApplication);
    }

    @Operation(summary = "Submit application", description = "Submit application for review")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application submitted successfully"),
        @ApiResponse(responseCode = "400", description = "Application cannot be submitted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Applicant only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/{id}/submit")
    @PreAuthorize("@applicationService.isApplicationOwner(#id, authentication.name)")
    public ResponseEntity<Application> submitApplication(
            @Parameter(description = "Application ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Submitting application: {} by user: {}", id, authentication.getName());
        
        Application submittedApplication = applicationService.submitApplication(id, authentication.getName());
        return ResponseEntity.ok(submittedApplication);
    }

    @Operation(summary = "Approve application", description = "Approve an application (Business owner only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application approved successfully"),
        @ApiResponse(responseCode = "400", description = "Application cannot be approved"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business owner only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or @applicationService.isApplicationBusinessOwner(#id, authentication.name)")
    public ResponseEntity<Application> approveApplication(
            @Parameter(description = "Application ID") @PathVariable String id,
            @RequestParam(required = false) String comments,
            Authentication authentication) {
        log.info("Approving application: {} by user: {}", id, authentication.getName());
        
        Application approvedApplication = applicationService.approveApplication(id, comments, authentication.getName());
        return ResponseEntity.ok(approvedApplication);
    }

    @Operation(summary = "Reject application", description = "Reject an application (Business owner only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application rejected successfully"),
        @ApiResponse(responseCode = "400", description = "Application cannot be rejected"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Business owner only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or @applicationService.isApplicationBusinessOwner(#id, authentication.name)")
    public ResponseEntity<Application> rejectApplication(
            @Parameter(description = "Application ID") @PathVariable String id,
            @RequestParam String reason,
            Authentication authentication) {
        log.info("Rejecting application: {} by user: {}", id, authentication.getName());
        
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("Rejection reason is required");
        }
        
        Application rejectedApplication = applicationService.rejectApplication(id, reason, authentication.getName());
        return ResponseEntity.ok(rejectedApplication);
    }

    @Operation(summary = "Withdraw application", description = "Withdraw an application (Applicant only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application withdrawn successfully"),
        @ApiResponse(responseCode = "400", description = "Application cannot be withdrawn"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Applicant only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/{id}/withdraw")
    @PreAuthorize("@applicationService.isApplicationOwner(#id, authentication.name)")
    public ResponseEntity<Application> withdrawApplication(
            @Parameter(description = "Application ID") @PathVariable String id,
            Authentication authentication) {
        log.info("Withdrawing application: {} by user: {}", id, authentication.getName());
        
        Application withdrawnApplication = applicationService.withdrawApplication(id, authentication.getName());
        return ResponseEntity.ok(withdrawnApplication);
    }

    @Operation(summary = "Get application documents", description = "Get documents for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved documents"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasRole('ADMIN') or @applicationService.isApplicationOwner(#id, authentication.name) or @applicationService.isApplicationBusinessOwner(#id, authentication.name)")
    public ResponseEntity<List<ApplicationDocument>> getApplicationDocuments(
            @Parameter(description = "Application ID") @PathVariable String id) {
        log.info("Getting documents for application: {}", id);
        List<ApplicationDocument> documents = applicationService.getApplicationDocuments(id);
        return ResponseEntity.ok(documents);
    }

    @Operation(summary = "Upload application document", description = "Upload a document for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid document data"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Applicant only"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    @PostMapping("/{id}/documents")
    @PreAuthorize("@applicationService.isApplicationOwner(#id, authentication.name)")
    public ResponseEntity<ApplicationDocument> uploadDocument(
            @Parameter(description = "Application ID") @PathVariable String id,
            @Valid @RequestBody ApplicationDto.UploadDocumentRequest request,
            Authentication authentication) {
        log.info("Uploading document for application: {} by user: {}", id, authentication.getName());
        
        ApplicationDocument document = new ApplicationDocument();
        try {
            ApplicationDocument.DocumentType documentType = ApplicationDocument.DocumentType.valueOf(request.getType().toUpperCase());
            document.setType(documentType);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid document type: " + request.getType());
        }
        document.setFileName(request.getFileName());
        document.setFileUrl(request.getFileUrl());
        document.setFileSize(request.getFileSize());
        document.setMimeType(request.getMimeType());
        
        ApplicationDocument uploadedDocument = applicationService.uploadDocument(id, document, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploadedDocument);
    }

    @Operation(summary = "Delete application document", description = "Delete a document from an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Applicant only"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/{id}/documents/{documentId}")
    @PreAuthorize("@applicationService.isApplicationOwner(#id, authentication.name)")
    public ResponseEntity<Void> deleteDocument(
            @Parameter(description = "Application ID") @PathVariable String id,
            @Parameter(description = "Document ID") @PathVariable String documentId,
            Authentication authentication) {
        log.info("Deleting document: {} from application: {} by user: {}", documentId, id, authentication.getName());
        
        applicationService.deleteDocument(id, documentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get application statistics", description = "Get application statistics (Admin only)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin only")
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApplicationService.ApplicationStats> getApplicationStats() {
        log.info("Getting application statistics");
        ApplicationService.ApplicationStats stats = applicationService.getApplicationStats();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get application statistics by franchise", description = "Get application statistics for a franchise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved statistics"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    @GetMapping("/stats/franchise/{franchiseId}")
    @PreAuthorize("hasRole('ADMIN') or @franchiseService.isFranchiseOwner(#franchiseId, authentication.name)")
    public ResponseEntity<ApplicationService.ApplicationStats> getApplicationStatsByFranchise(
            @Parameter(description = "Franchise ID") @PathVariable String franchiseId) {
        log.info("Getting application statistics for franchise: {}", franchiseId);
        ApplicationService.ApplicationStats stats = applicationService.getApplicationStatsByFranchise(franchiseId);
        return ResponseEntity.ok(stats);
    }

    // Helper methods for DTO mapping
    private Application mapToApplication(ApplicationDto.CreateApplicationRequest request) {
        Application application = new Application();
        application.setFranchiseId(request.getFranchiseId());
        application.setFranchiseName(request.getFranchiseName());
        application.setApplicationFee(request.getApplicationFee());
        // Add more mapping as needed
        return application;
    }

    private Application mapToApplication(ApplicationDto.UpdateApplicationRequest request) {
        Application application = new Application();
        // Add mapping as needed
        return application;
    }
}
