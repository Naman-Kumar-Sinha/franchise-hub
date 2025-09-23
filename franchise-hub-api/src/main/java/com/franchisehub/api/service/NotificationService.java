package com.franchisehub.api.service;

import com.franchisehub.api.model.Notification;
import com.franchisehub.api.model.User;
import com.franchisehub.api.repository.NotificationRepository;
import com.franchisehub.api.repository.UserRepository;
import com.franchisehub.api.exception.ResourceNotFoundException;
import com.franchisehub.api.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Get all notifications with pagination
     */
    @Transactional(readOnly = true)
    public Page<Notification> getAllNotifications(Pageable pageable) {
        log.debug("Getting all notifications with pagination: {}", pageable);
        return notificationRepository.findAll(pageable);
    }

    /**
     * Get notification by ID
     */
    @Transactional(readOnly = true)
    public Notification getNotificationById(String id) {
        log.debug("Getting notification by ID: {}", id);
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
    }

    /**
     * Get notifications by user ID
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByUserId(String userId, Pageable pageable) {
        log.debug("Getting notifications by user ID: {} with pagination: {}", userId, pageable);
        return notificationRepository.findByUserId(userId, pageable);
    }

    /**
     * Get unread notifications by user ID
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotificationsByUserId(String userId) {
        log.debug("Getting unread notifications by user ID: {}", userId);
        return notificationRepository.findByUserIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
    }

    /**
     * Get notifications by user ID and status
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByUserIdAndStatus(String userId, Notification.NotificationStatus status, Pageable pageable) {
        log.debug("Getting notifications by user ID: {} and status: {} with pagination: {}", userId, status, pageable);
        return notificationRepository.findByUserIdAndStatus(userId, status, pageable);
    }

    /**
     * Get notifications by type
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByType(Notification.NotificationType type, Pageable pageable) {
        log.debug("Getting notifications by type: {} with pagination: {}", type, pageable);
        return notificationRepository.findByType(type, pageable);
    }

    /**
     * Get notifications by priority
     */
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsByPriority(Notification.NotificationPriority priority, Pageable pageable) {
        log.debug("Getting notifications by priority: {} with pagination: {}", priority, pageable);
        return notificationRepository.findByPriority(priority, pageable);
    }

    /**
     * Create a new notification
     */
    public Notification createNotification(Notification notification) {
        log.debug("Creating new notification for user: {}", notification.getUserId());
        
        // Validate user exists
        User user = userRepository.findById(notification.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + notification.getUserId()));

        // Set notification details
        notification.setCreatedAt(LocalDateTime.now());
        
        // Set default status if not provided
        if (notification.getStatus() == null) {
            notification.setStatus(Notification.NotificationStatus.UNREAD);
        }

        // Set default priority if not provided
        if (notification.getPriority() == null) {
            notification.setPriority(Notification.NotificationPriority.MEDIUM);
        }

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Created notification with ID: {}", savedNotification.getId());
        return savedNotification;
    }

    /**
     * Create application update notification
     */
    public Notification createApplicationUpdateNotification(String userId, String applicationId, 
                                                           String franchiseId, String title, String message) {
        log.debug("Creating application update notification for user: {}", userId);
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.APPLICATION_UPDATE);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setApplicationId(applicationId);
        notification.setFranchiseId(franchiseId);
        notification.setPriority(Notification.NotificationPriority.HIGH);
        notification.setActionText("View Application");
        notification.setActionUrl("/applications/" + applicationId);

        return createNotification(notification);
    }

    /**
     * Create payment request notification
     */
    public Notification createPaymentRequestNotification(String userId, String paymentRequestId, 
                                                        String franchiseId, String title, String message) {
        log.debug("Creating payment request notification for user: {}", userId);
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.PAYMENT_REQUEST);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPaymentRequestId(paymentRequestId);
        notification.setFranchiseId(franchiseId);
        notification.setPriority(Notification.NotificationPriority.HIGH);
        notification.setActionText("Pay Now");
        notification.setActionUrl("/payments/requests/" + paymentRequestId);

        return createNotification(notification);
    }

    /**
     * Create partnership update notification
     */
    public Notification createPartnershipUpdateNotification(String userId, String franchiseId, 
                                                           String title, String message) {
        log.debug("Creating partnership update notification for user: {}", userId);
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.PARTNERSHIP_UPDATE);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setFranchiseId(franchiseId);
        notification.setPriority(Notification.NotificationPriority.MEDIUM);
        notification.setActionText("View Details");
        notification.setActionUrl("/franchises/" + franchiseId);

        return createNotification(notification);
    }

    /**
     * Create system alert notification
     */
    public Notification createSystemAlertNotification(String userId, String title, String message, 
                                                     Notification.NotificationPriority priority) {
        log.debug("Creating system alert notification for user: {}", userId);
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.SYSTEM_ALERT);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setPriority(priority);

        return createNotification(notification);
    }

    /**
     * Create document required notification
     */
    public Notification createDocumentRequiredNotification(String userId, String applicationId, 
                                                          String franchiseId, String documentType) {
        log.debug("Creating document required notification for user: {}", userId);
        
        String title = "Document Required";
        String message = "Please upload the required document: " + documentType;
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.DOCUMENT_REQUIRED);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setApplicationId(applicationId);
        notification.setFranchiseId(franchiseId);
        notification.setPriority(Notification.NotificationPriority.HIGH);
        notification.setActionText("Upload Document");
        notification.setActionUrl("/applications/" + applicationId + "/documents");

        return createNotification(notification);
    }

    /**
     * Create approval notification
     */
    public Notification createApprovalNotification(String userId, String applicationId, 
                                                  String franchiseId, String title, String message) {
        log.debug("Creating approval notification for user: {}", userId);
        
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(Notification.NotificationType.APPROVAL_NOTIFICATION);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setApplicationId(applicationId);
        notification.setFranchiseId(franchiseId);
        notification.setPriority(Notification.NotificationPriority.HIGH);
        notification.setActionText("View Application");
        notification.setActionUrl("/applications/" + applicationId);

        return createNotification(notification);
    }

    /**
     * Mark notification as read
     */
    public Notification markAsRead(String id, String userId) {
        log.debug("Marking notification as read: {} by user: {}", id, userId);
        
        Notification notification = getNotificationById(id);
        
        // Verify ownership
        if (!notification.getUserId().equals(userId)) {
            throw new BadRequestException("You can only mark your own notifications as read");
        }

        // Check if already read
        if (notification.getStatus() == Notification.NotificationStatus.READ) {
            return notification; // Already read, no change needed
        }

        // Update status
        notification.setStatus(Notification.NotificationStatus.READ);
        notification.setReadAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Marked notification as read with ID: {}", id);
        return savedNotification;
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsReadForUser(String userId) {
        log.debug("Marking all notifications as read for user: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Notification> unreadNotifications = getUnreadNotificationsByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        
        for (Notification notification : unreadNotifications) {
            notification.setStatus(Notification.NotificationStatus.READ);
            notification.setReadAt(now);
        }

        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user: {}", unreadNotifications.size(), userId);
    }

    /**
     * Delete notification
     */
    public void deleteNotification(String id, String userId) {
        log.debug("Deleting notification: {} by user: {}", id, userId);
        
        Notification notification = getNotificationById(id);
        
        // Verify ownership
        if (!notification.getUserId().equals(userId)) {
            throw new BadRequestException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
        log.info("Deleted notification with ID: {}", id);
    }

    /**
     * Delete all read notifications for a user
     */
    public void deleteAllReadNotificationsForUser(String userId) {
        log.debug("Deleting all read notifications for user: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Notification> readNotifications = notificationRepository.findByUserIdAndStatus(userId, Notification.NotificationStatus.READ);
        notificationRepository.deleteAll(readNotifications);
        log.info("Deleted {} read notifications for user: {}", readNotifications.size(), userId);
    }

    /**
     * Get notification count by user and status
     */
    @Transactional(readOnly = true)
    public long getNotificationCountByUserAndStatus(String userId, Notification.NotificationStatus status) {
        log.debug("Getting notification count for user: {} with status: {}", userId, status);
        return notificationRepository.countByUserIdAndStatus(userId, status);
    }

    /**
     * Get unread notification count for user
     */
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(String userId) {
        log.debug("Getting unread notification count for user: {}", userId);
        return getNotificationCountByUserAndStatus(userId, Notification.NotificationStatus.UNREAD);
    }

    /**
     * Clean up expired notifications
     */
    @Transactional
    public void cleanupExpiredNotifications() {
        log.debug("Cleaning up expired notifications");
        
        LocalDateTime now = LocalDateTime.now();
        List<Notification> expiredNotifications = notificationRepository.findExpiredNotifications(now);
        
        notificationRepository.deleteAll(expiredNotifications);
        log.info("Cleaned up {} expired notifications", expiredNotifications.size());
    }

    /**
     * Get notification statistics
     */
    @Transactional(readOnly = true)
    public NotificationStats getNotificationStats() {
        log.debug("Getting notification statistics");
        
        long totalNotifications = notificationRepository.count();
        long unreadNotifications = notificationRepository.countByStatus(Notification.NotificationStatus.UNREAD);
        long readNotifications = notificationRepository.countByStatus(Notification.NotificationStatus.READ);
        
        return new NotificationStats(totalNotifications, unreadNotifications, readNotifications);
    }

    /**
     * Get notification statistics by user
     */
    @Transactional(readOnly = true)
    public NotificationStats getNotificationStatsByUser(String userId) {
        log.debug("Getting notification statistics for user: {}", userId);
        
        long totalNotifications = notificationRepository.countByUserId(userId);
        long unreadNotifications = notificationRepository.countByUserIdAndStatus(userId, Notification.NotificationStatus.UNREAD);
        long readNotifications = notificationRepository.countByUserIdAndStatus(userId, Notification.NotificationStatus.READ);
        
        return new NotificationStats(totalNotifications, unreadNotifications, readNotifications);
    }

    /**
     * Inner class for notification statistics
     */
    public static class NotificationStats {
        private final long total;
        private final long unread;
        private final long read;

        public NotificationStats(long total, long unread, long read) {
            this.total = total;
            this.unread = unread;
            this.read = read;
        }

        public long getTotal() { return total; }
        public long getUnread() { return unread; }
        public long getRead() { return read; }
    }
}
