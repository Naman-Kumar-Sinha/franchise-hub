package com.franchisehub.api.repository;

import com.franchisehub.api.model.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, String> {

    List<PaymentTransaction> findByUserId(String userId);

    Page<PaymentTransaction> findByUserId(String userId, Pageable pageable);

    List<PaymentTransaction> findByFranchiseId(String franchiseId);

    Page<PaymentTransaction> findByFranchiseId(String franchiseId, Pageable pageable);

    List<PaymentTransaction> findByApplicationId(String applicationId);

    Page<PaymentTransaction> findByApplicationId(String applicationId, Pageable pageable);

    Optional<PaymentTransaction> findByPaymentRequestId(String paymentRequestId);

    List<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status);

    Page<PaymentTransaction> findByStatus(PaymentTransaction.TransactionStatus status, Pageable pageable);

    List<PaymentTransaction> findByType(PaymentTransaction.TransactionType type);

    Page<PaymentTransaction> findByType(PaymentTransaction.TransactionType type, Pageable pageable);

    List<PaymentTransaction> findByMethod(PaymentTransaction.PaymentMethod method);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.userId = :userId AND pt.status = :status")
    List<PaymentTransaction> findByUserIdAndStatus(
        @Param("userId") String userId, 
        @Param("status") PaymentTransaction.TransactionStatus status
    );

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.userId = :userId AND pt.type = :type")
    List<PaymentTransaction> findByUserIdAndType(
        @Param("userId") String userId, 
        @Param("type") PaymentTransaction.TransactionType type
    );

    @Query("SELECT pt FROM PaymentTransaction pt WHERE " +
           "pt.createdAt >= :startDate AND pt.createdAt <= :endDate")
    List<PaymentTransaction> findByDateRange(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT pt FROM PaymentTransaction pt WHERE " +
           "pt.createdAt >= :startDate AND pt.createdAt <= :endDate")
    Page<PaymentTransaction> findByDateRange(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    @Query("SELECT pt FROM PaymentTransaction pt WHERE " +
           "pt.userId = :userId AND " +
           "pt.createdAt >= :startDate AND pt.createdAt <= :endDate")
    List<PaymentTransaction> findByUserIdAndDateRange(
        @Param("userId") String userId,
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(pt.amount) FROM PaymentTransaction pt WHERE " +
           "pt.status = 'SUCCESS' AND pt.createdAt >= :since")
    BigDecimal getTotalAmountSince(@Param("since") LocalDateTime since);

    @Query("SELECT SUM(pt.amount) FROM PaymentTransaction pt WHERE " +
           "pt.userId = :userId AND pt.status = 'SUCCESS'")
    BigDecimal getTotalAmountByUser(@Param("userId") String userId);

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.createdAt >= :since")
    long countTransactionsSince(@Param("since") LocalDateTime since);

    @Query("SELECT pt.status, COUNT(pt) FROM PaymentTransaction pt GROUP BY pt.status")
    List<Object[]> getTransactionCountByStatus();

    @Query("SELECT pt.type, COUNT(pt) FROM PaymentTransaction pt WHERE pt.status = 'SUCCESS' GROUP BY pt.type")
    List<Object[]> getSuccessfulTransactionCountByType();

    @Query("SELECT pt.method, COUNT(pt) FROM PaymentTransaction pt WHERE pt.status = 'SUCCESS' GROUP BY pt.method")
    List<Object[]> getSuccessfulTransactionCountByMethod();

    @Query("SELECT DATE(pt.createdAt), SUM(pt.amount) FROM PaymentTransaction pt WHERE " +
           "pt.status = 'SUCCESS' AND pt.createdAt >= :since GROUP BY DATE(pt.createdAt)")
    List<Object[]> getDailyRevenue(@Param("since") LocalDateTime since);

    // Additional methods needed by PaymentService
    long countByStatus(PaymentTransaction.TransactionStatus status);

    @Query("SELECT SUM(pt.amount) FROM PaymentTransaction pt WHERE pt.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentTransaction.TransactionStatus status);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.createdAt >= :since ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findTransactionsCreatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.createdAt >= :since")
    long countTransactionsCreatedSince(@Param("since") LocalDateTime since);

    // Methods for business owner statistics
    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId)")
    long countTransactionsForBusinessOwner(@Param("businessOwnerId") String businessOwnerId);

    @Query("SELECT COUNT(pt) FROM PaymentTransaction pt WHERE pt.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId) AND pt.status = :status")
    long countTransactionsForBusinessOwnerByStatus(@Param("businessOwnerId") String businessOwnerId,
                                                   @Param("status") PaymentTransaction.TransactionStatus status);

    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PaymentTransaction pt WHERE pt.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId) AND pt.status = 'SUCCESS'")
    BigDecimal getTotalRevenueForBusinessOwner(@Param("businessOwnerId") String businessOwnerId);

    @Query("SELECT COALESCE(SUM(pt.amount), 0) FROM PaymentTransaction pt WHERE pt.franchiseId IN " +
           "(SELECT f.id FROM Franchise f WHERE f.businessOwnerId = :businessOwnerId) AND pt.status = 'SUCCESS' " +
           "AND pt.createdAt >= :since")
    BigDecimal getRevenueForBusinessOwnerSince(@Param("businessOwnerId") String businessOwnerId,
                                               @Param("since") LocalDateTime since);
}
