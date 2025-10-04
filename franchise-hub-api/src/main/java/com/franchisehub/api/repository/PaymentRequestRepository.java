package com.franchisehub.api.repository;

import com.franchisehub.api.model.PaymentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, String> {

    List<PaymentRequest> findByFromUserId(String fromUserId);

    Page<PaymentRequest> findByFromUserId(String fromUserId, Pageable pageable);

    List<PaymentRequest> findByToUserId(String toUserId);

    Page<PaymentRequest> findByToUserId(String toUserId, Pageable pageable);

    List<PaymentRequest> findByFranchiseId(String franchiseId);

    List<PaymentRequest> findByApplicationId(String applicationId);

    Page<PaymentRequest> findByApplicationId(String applicationId, Pageable pageable);

    List<PaymentRequest> findByStatus(PaymentRequest.PaymentRequestStatus status);

    Page<PaymentRequest> findByStatus(PaymentRequest.PaymentRequestStatus status, Pageable pageable);

    List<PaymentRequest> findByType(PaymentRequest.PaymentRequestType type);

    @Query("SELECT pr FROM PaymentRequest pr WHERE pr.toUserId = :userId AND pr.status = :status")
    List<PaymentRequest> findByToUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") PaymentRequest.PaymentRequestStatus status
    );

    @Query("SELECT pr FROM PaymentRequest pr WHERE pr.fromUserId = :userId AND pr.status = :status")
    List<PaymentRequest> findByFromUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") PaymentRequest.PaymentRequestStatus status
    );

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "(pr.fromUserId = :userId OR pr.toUserId = :userId)")
    List<PaymentRequest> findByUserId(@Param("userId") String userId);

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "(pr.fromUserId = :userId OR pr.toUserId = :userId)")
    Page<PaymentRequest> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "(pr.fromUserId = :userId OR pr.toUserId = :userId) AND pr.status = :status")
    List<PaymentRequest> findByUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") PaymentRequest.PaymentRequestStatus status
    );

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "pr.status = 'PENDING' AND pr.dueDate < :currentDate")
    List<PaymentRequest> findOverduePaymentRequests(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "pr.status = 'PENDING' AND pr.dueDate BETWEEN :startDate AND :endDate")
    List<PaymentRequest> findPaymentRequestsDueSoon(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT pr FROM PaymentRequest pr WHERE " +
           "pr.franchiseId = :franchiseId AND pr.status = :status")
    List<PaymentRequest> findByFranchiseIdAndStatus(
        @Param("franchiseId") String franchiseId, 
        @Param("status") PaymentRequest.PaymentRequestStatus status
    );

    @Query("SELECT COUNT(pr) FROM PaymentRequest pr WHERE pr.toUserId = :userId AND pr.status = 'PENDING'")
    long countPendingRequestsByUser(@Param("userId") String userId);

    @Query("SELECT COUNT(pr) FROM PaymentRequest pr WHERE pr.createdAt >= :since")
    long countPaymentRequestsCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT pr.status, COUNT(pr) FROM PaymentRequest pr GROUP BY pr.status")
    List<Object[]> getPaymentRequestCountByStatus();

    @Query("SELECT pr.type, COUNT(pr) FROM PaymentRequest pr WHERE pr.status = 'PAID' GROUP BY pr.type")
    List<Object[]> getPaidRequestCountByType();
}
