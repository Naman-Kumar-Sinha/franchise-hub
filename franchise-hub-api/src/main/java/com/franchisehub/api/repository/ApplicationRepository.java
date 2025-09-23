package com.franchisehub.api.repository;

import com.franchisehub.api.model.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {

    List<Application> findByApplicantId(String applicantId);

    Page<Application> findByApplicantId(String applicantId, Pageable pageable);

    List<Application> findByFranchiseId(String franchiseId);

    Page<Application> findByFranchiseId(String franchiseId, Pageable pageable);

    List<Application> findByStatus(Application.ApplicationStatus status);

    Page<Application> findByStatus(Application.ApplicationStatus status, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId)")
    List<Application> findByBusinessOwnerId(@Param("businessOwnerId") String businessOwnerId);

    @Query("SELECT a FROM Application a WHERE a.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId)")
    Page<Application> findByBusinessOwnerId(@Param("businessOwnerId") String businessOwnerId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId) " +
           "AND a.status = :status")
    List<Application> findByBusinessOwnerIdAndStatus(
        @Param("businessOwnerId") String businessOwnerId, 
        @Param("status") Application.ApplicationStatus status
    );

    @Query("SELECT a FROM Application a WHERE a.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId) " +
           "AND a.status = :status")
    Page<Application> findByBusinessOwnerIdAndStatus(
        @Param("businessOwnerId") String businessOwnerId, 
        @Param("status") Application.ApplicationStatus status,
        Pageable pageable
    );

    List<Application> findByPaymentStatus(Application.PaymentStatus paymentStatus);

    @Query("SELECT a FROM Application a WHERE a.isActive = true ORDER BY a.submittedAt DESC")
    List<Application> findActiveApplications();

    @Query("SELECT a FROM Application a WHERE a.isActive = true ORDER BY a.submittedAt DESC")
    Page<Application> findActiveApplications(Pageable pageable);

    @Query("SELECT a FROM Application a WHERE " +
           "a.isActive = true AND " +
           "(LOWER(a.applicantName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.applicantEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.franchiseName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Application> searchActiveApplications(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.applicantId = :applicantId AND a.status = :status")
    long countByApplicantIdAndStatus(
        @Param("applicantId") String applicantId, 
        @Param("status") Application.ApplicationStatus status
    );

    @Query("SELECT COUNT(a) FROM Application a WHERE a.franchiseId = :franchiseId AND a.status = :status")
    long countByFranchiseIdAndStatus(
        @Param("franchiseId") String franchiseId, 
        @Param("status") Application.ApplicationStatus status
    );

    @Query("SELECT COUNT(a) FROM Application a WHERE a.submittedAt >= :since")
    long countApplicationsSubmittedSince(@Param("since") LocalDateTime since);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.isActive = true GROUP BY a.status")
    List<Object[]> getApplicationCountByStatus();

    @Query("SELECT DATE(a.submittedAt), COUNT(a) FROM Application a WHERE a.submittedAt >= :since GROUP BY DATE(a.submittedAt)")
    List<Object[]> getApplicationCountByDate(@Param("since") LocalDateTime since);

    // Additional methods needed by ApplicationService
    @Query("SELECT a FROM Application a WHERE a.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId)")
    Page<Application> findApplicationsForBusinessOwner(@Param("businessOwnerId") String businessOwnerId, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.applicantId = :applicantId AND a.franchiseId = :franchiseId AND a.isActive = true")
    List<Application> findByApplicantIdAndFranchiseIdAndIsActiveTrue(@Param("applicantId") String applicantId, @Param("franchiseId") String franchiseId);

    Page<Application> findByApplicantIdAndStatus(String applicantId, Application.ApplicationStatus status, Pageable pageable);

    long countByStatus(Application.ApplicationStatus status);

    long countByFranchiseId(String franchiseId);

    @Query("SELECT a FROM Application a WHERE a.submittedAt >= :since ORDER BY a.submittedAt DESC")
    List<Application> findApplicationsCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.submittedAt >= :since")
    long countApplicationsCreatedSince(@Param("since") LocalDateTime since);

}
