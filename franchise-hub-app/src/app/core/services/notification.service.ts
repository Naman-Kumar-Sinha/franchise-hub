import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { MockDataService } from './mock-data.service';
import { ApiNotificationService } from './api-notification.service';
import { 
  Notification, 
  NotificationType, 
  NotificationStatus 
} from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private authService = inject(AuthService);
  private mockDataService = inject(MockDataService);
  private apiNotificationService = inject(ApiNotificationService);

  // Get notifications for a user
  getNotificationsForUser(userId: string): Observable<Notification[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getNotificationsForUser(userId);
    } else {
      return this.apiNotificationService.getNotificationsForUser(userId).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.getNotificationsForUser(userId)
        ))
      );
    }
  }

  // Get all notifications (admin/business owner view)
  getNotifications(filters?: any): Observable<Notification[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.notifications$;
    } else {
      return this.apiNotificationService.getNotifications(filters).pipe(
        catchError(error => this.handleApiError(error, () => this.mockDataService.notifications$))
      );
    }
  }

  // Get notification by ID
  getNotificationById(id: string): Observable<Notification | undefined> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.notifications$.pipe(
        switchMap(notifications => of(notifications.find(n => n.id === id)))
      );
    } else {
      return this.apiNotificationService.getNotificationById(id).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.notifications$.pipe(
            switchMap(notifications => of(notifications.find(n => n.id === id)))
          )
        ))
      );
    }
  }

  // Create a new notification
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    applicationId?: string,
    franchiseId?: string,
    paymentRequestId?: string,
    actionUrl?: string,
    actionText?: string
  ): Observable<Notification> {
    if (this.shouldUseMockService()) {
      const notification = this.mockDataService.createNotification(
        userId, type, title, message, applicationId, franchiseId, 
        paymentRequestId, actionUrl, actionText
      );
      return of(notification);
    } else {
      return this.apiNotificationService.createNotification(
        userId, type, title, message, applicationId, franchiseId, 
        paymentRequestId, actionUrl, actionText
      ).pipe(
        catchError(error => this.handleApiError(error, () => {
          const notification = this.mockDataService.createNotification(
            userId, type, title, message, applicationId, franchiseId, 
            paymentRequestId, actionUrl, actionText
          );
          return of(notification);
        }))
      );
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<Notification> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.notifications$.pipe(
        switchMap(notifications => {
          const notification = notifications.find(n => n.id === notificationId);
          if (notification) {
            const updatedNotification = {
              ...notification,
              status: NotificationStatus.READ,
              readAt: new Date()
            };
            return of(updatedNotification);
          }
          throw new Error('Notification not found');
        })
      );
    } else {
      return this.apiNotificationService.markAsRead(notificationId).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.notifications$.pipe(
            switchMap(notifications => {
              const notification = notifications.find(n => n.id === notificationId);
              if (notification) {
                const updatedNotification = {
                  ...notification,
                  status: NotificationStatus.READ,
                  readAt: new Date()
                };
                return of(updatedNotification);
              }
              throw new Error('Notification not found');
            })
          )
        ))
      );
    }
  }

  // Mark multiple notifications as read
  markMultipleAsRead(notificationIds: string[]): Observable<Notification[]> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.notifications$.pipe(
        switchMap(notifications => {
          const updatedNotifications = notifications
            .filter(n => notificationIds.includes(n.id))
            .map(n => ({
              ...n,
              status: NotificationStatus.READ,
              readAt: new Date()
            }));
          return of(updatedNotifications);
        })
      );
    } else {
      return this.apiNotificationService.markMultipleAsRead(notificationIds).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.notifications$.pipe(
            switchMap(notifications => {
              const updatedNotifications = notifications
                .filter(n => notificationIds.includes(n.id))
                .map(n => ({
                  ...n,
                  status: NotificationStatus.READ,
                  readAt: new Date()
                }));
              return of(updatedNotifications);
            })
          )
        ))
      );
    }
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock service doesn't have this method, so we'll simulate it
      return of(void 0);
    } else {
      return this.apiNotificationService.markAllAsRead(userId).pipe(
        catchError(error => this.handleApiError(error, () => of(void 0)))
      );
    }
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock service doesn't have this method, so we'll simulate it
      return of(void 0);
    } else {
      return this.apiNotificationService.deleteNotification(notificationId).pipe(
        catchError(error => this.handleApiError(error, () => of(void 0)))
      );
    }
  }

  // Delete multiple notifications
  deleteMultipleNotifications(notificationIds: string[]): Observable<void> {
    if (this.shouldUseMockService()) {
      // Mock service doesn't have this method, so we'll simulate it
      return of(void 0);
    } else {
      return this.apiNotificationService.deleteMultipleNotifications(notificationIds).pipe(
        catchError(error => this.handleApiError(error, () => of(void 0)))
      );
    }
  }

  // Get unread count for a user
  getUnreadCount(userId: string): Observable<number> {
    if (this.shouldUseMockService()) {
      return this.mockDataService.getNotificationsForUser(userId).pipe(
        switchMap(notifications => {
          const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;
          return of(unreadCount);
        })
      );
    } else {
      return this.apiNotificationService.getUnreadCount(userId).pipe(
        catchError(error => this.handleApiError(error, () => 
          this.mockDataService.getNotificationsForUser(userId).pipe(
            switchMap(notifications => {
              const unreadCount = notifications.filter(n => n.status === NotificationStatus.UNREAD).length;
              return of(unreadCount);
            })
          )
        ))
      );
    }
  }

  // Helper Methods
  private shouldUseMockService(): boolean {
    if (!environment.features.hybridAuth) {
      return !environment.features.realApiIntegration;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return true; // Default to mock if no user
    }

    // Check if current user is a demo account
    return environment.features.demoAccounts.includes(currentUser.email);
  }

  private handleApiError<T>(error: any, fallbackFn: () => Observable<T>): Observable<T> {
    if (environment.dev.enableApiLogging) {
      console.error('Notification API Error:', error);
    }

    if (environment.features.mockFallback) {
      console.warn('Notification API failed, falling back to mock service');
      return fallbackFn();
    }

    throw error;
  }
}
