package com.franchisehub.api.repository;

import com.franchisehub.api.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserId(String userId);

    Page<Notification> findByUserId(String userId, Pageable pageable);

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    Page<Notification> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Notification> findByUserIdAndStatus(String userId, Notification.NotificationStatus status);

    Page<Notification> findByUserIdAndStatus(String userId, Notification.NotificationStatus status, Pageable pageable);

    List<Notification> findByType(Notification.NotificationType type);

    List<Notification> findByPriority(Notification.NotificationPriority priority);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD' ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") String userId);

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD' ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE " +
           "n.userId = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(
        @Param("userId") String userId, 
        @Param("type") Notification.NotificationType type
    );

    @Query("SELECT n FROM Notification n WHERE " +
           "n.expiresAt IS NOT NULL AND n.expiresAt < :currentDate")
    List<Notification> findExpiredNotifications(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT n FROM Notification n WHERE " +
           "n.userId = :userId AND " +
           "(n.expiresAt IS NULL OR n.expiresAt > :currentDate) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findActiveByUserId(
        @Param("userId") String userId, 
        @Param("currentDate") LocalDateTime currentDate
    );

    @Query("SELECT n FROM Notification n WHERE " +
           "n.userId = :userId AND " +
           "(n.expiresAt IS NULL OR n.expiresAt > :currentDate) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findActiveByUserId(
        @Param("userId") String userId, 
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    @Query("SELECT n FROM Notification n WHERE " +
           "n.applicationId = :applicationId ORDER BY n.createdAt DESC")
    List<Notification> findByApplicationId(@Param("applicationId") String applicationId);

    @Query("SELECT n FROM Notification n WHERE " +
           "n.franchiseId = :franchiseId ORDER BY n.createdAt DESC")
    List<Notification> findByFranchiseId(@Param("franchiseId") String franchiseId);

    @Query("SELECT n FROM Notification n WHERE " +
           "n.paymentRequestId = :paymentRequestId ORDER BY n.createdAt DESC")
    List<Notification> findByPaymentRequestId(@Param("paymentRequestId") String paymentRequestId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status = 'UNREAD'")
    long countUnreadByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.createdAt >= :since")
    long countNotificationsCreatedSince(@Param("since") LocalDateTime since);

    @Modifying
    @Query("UPDATE Notification n SET n.status = 'read', n.readAt = :readAt WHERE n.userId = :userId AND n.status = 'UNREAD'")
    int markAllAsReadByUserId(@Param("userId") String userId, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :currentDate")
    int deleteExpiredNotifications(@Param("currentDate") LocalDateTime currentDate);

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.createdAt >= :since GROUP BY n.type")
    List<Object[]> getNotificationCountByType(@Param("since") LocalDateTime since);

    @Query("SELECT n.status, COUNT(n) FROM Notification n WHERE n.userId = :userId GROUP BY n.status")
    List<Object[]> getNotificationCountByStatusForUser(@Param("userId") String userId);
}
