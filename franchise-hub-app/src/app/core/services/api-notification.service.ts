import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Notification, 
  NotificationType, 
  NotificationStatus 
} from '../models/application.model';

export interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: {
    applicationId?: string;
    franchiseId?: string;
    paymentRequestId?: string;
    actionUrl?: string;
    actionText?: string;
  };
  read: boolean;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiNotificationService {
  private http = inject(HttpClient);

  // Get notifications for a user
  getNotificationsForUser(userId: string): Observable<Notification[]> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.list}`;
    const params = { userId };
    
    return this.http.get<ApiNotification[]>(url, { params }).pipe(
      map(apiNotifications => apiNotifications.map(n => this.mapApiNotificationToNotification(n))),
      catchError(this.handleError)
    );
  }

  // Get all notifications (admin/business owner view)
  getNotifications(filters?: any): Observable<Notification[]> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.list}`;
    const params = this.buildQueryParams(filters);
    
    return this.http.get<ApiNotification[]>(url, { params }).pipe(
      map(apiNotifications => apiNotifications.map(n => this.mapApiNotificationToNotification(n))),
      catchError(this.handleError)
    );
  }

  // Get notification by ID
  getNotificationById(id: string): Observable<Notification> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.list}/${id}`;
    
    return this.http.get<ApiNotification>(url).pipe(
      map(apiNotification => this.mapApiNotificationToNotification(apiNotification)),
      catchError(this.handleError)
    );
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
    const url = `${environment.apiUrl}${environment.endpoints.notifications.create}`;
    
    const notificationData = {
      userId,
      type: this.mapNotificationTypeToApiType(type),
      title,
      message,
      data: {
        applicationId,
        franchiseId,
        paymentRequestId,
        actionUrl,
        actionText
      }
    };
    
    return this.http.post<ApiNotification>(url, notificationData).pipe(
      map(apiNotification => this.mapApiNotificationToNotification(apiNotification)),
      catchError(this.handleError)
    );
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<Notification> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.markRead}/${notificationId}`;
    
    return this.http.patch<ApiNotification>(url, {}).pipe(
      map(apiNotification => this.mapApiNotificationToNotification(apiNotification)),
      catchError(this.handleError)
    );
  }

  // Mark multiple notifications as read
  markMultipleAsRead(notificationIds: string[]): Observable<Notification[]> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.markMultipleRead}`;
    
    return this.http.patch<ApiNotification[]>(url, { notificationIds }).pipe(
      map(apiNotifications => apiNotifications.map(n => this.mapApiNotificationToNotification(n))),
      catchError(this.handleError)
    );
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): Observable<void> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.markAllRead}`;
    
    return this.http.patch<void>(url, { userId }).pipe(
      catchError(this.handleError)
    );
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<void> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.list}/${notificationId}`;
    
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  // Delete multiple notifications
  deleteMultipleNotifications(notificationIds: string[]): Observable<void> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.deleteMultiple}`;
    
    return this.http.delete<void>(url, { body: { notificationIds } }).pipe(
      catchError(this.handleError)
    );
  }

  // Get unread count for a user
  getUnreadCount(userId: string): Observable<number> {
    const url = `${environment.apiUrl}${environment.endpoints.notifications.unreadCount}`;
    const params = { userId };
    
    return this.http.get<{ count: number }>(url, { params }).pipe(
      map(response => response.count),
      catchError(this.handleError)
    );
  }

  // Mapping Methods
  private mapApiNotificationToNotification(apiNotification: ApiNotification): Notification {
    return {
      id: apiNotification.id,
      userId: apiNotification.userId,
      type: this.mapApiTypeToNotificationType(apiNotification.type),
      title: apiNotification.title,
      message: apiNotification.message,
      applicationId: apiNotification.data?.applicationId,
      franchiseId: apiNotification.data?.franchiseId,
      paymentRequestId: apiNotification.data?.paymentRequestId,
      actionUrl: apiNotification.data?.actionUrl,
      actionText: apiNotification.data?.actionText,
      status: apiNotification.read ? NotificationStatus.READ : NotificationStatus.UNREAD,
      readAt: apiNotification.readAt ? new Date(apiNotification.readAt) : undefined,
      createdAt: new Date(apiNotification.createdAt),
      expiresAt: apiNotification.expiresAt ? new Date(apiNotification.expiresAt) : undefined
    };
  }

  private mapNotificationTypeToApiType(type: NotificationType): string {
    const typeMap: Record<NotificationType, string> = {
      [NotificationType.APPLICATION_SUBMITTED]: 'APPLICATION_SUBMITTED',
      [NotificationType.APPLICATION_APPROVED]: 'APPLICATION_APPROVED',
      [NotificationType.APPLICATION_REJECTED]: 'APPLICATION_REJECTED',
      [NotificationType.PAYMENT_REQUEST]: 'PAYMENT_REQUEST',
      [NotificationType.PAYMENT_RECEIVED]: 'PAYMENT_RECEIVED',
      [NotificationType.PAYMENT_OVERDUE]: 'PAYMENT_OVERDUE',
      [NotificationType.FRANCHISE_CREATED]: 'FRANCHISE_CREATED',
      [NotificationType.FRANCHISE_UPDATED]: 'FRANCHISE_UPDATED',
      [NotificationType.PARTNERSHIP_ACTIVATED]: 'PARTNERSHIP_ACTIVATED',
      [NotificationType.PARTNERSHIP_DEACTIVATED]: 'PARTNERSHIP_DEACTIVATED',
      [NotificationType.SYSTEM_MAINTENANCE]: 'SYSTEM_MAINTENANCE',
      [NotificationType.GENERAL]: 'GENERAL'
    };
    return typeMap[type] || 'GENERAL';
  }

  private mapApiTypeToNotificationType(apiType: string): NotificationType {
    const typeMap: Record<string, NotificationType> = {
      'APPLICATION_SUBMITTED': NotificationType.APPLICATION_SUBMITTED,
      'APPLICATION_APPROVED': NotificationType.APPLICATION_APPROVED,
      'APPLICATION_REJECTED': NotificationType.APPLICATION_REJECTED,
      'PAYMENT_REQUEST': NotificationType.PAYMENT_REQUEST,
      'PAYMENT_RECEIVED': NotificationType.PAYMENT_RECEIVED,
      'PAYMENT_OVERDUE': NotificationType.PAYMENT_OVERDUE,
      'FRANCHISE_CREATED': NotificationType.FRANCHISE_CREATED,
      'FRANCHISE_UPDATED': NotificationType.FRANCHISE_UPDATED,
      'PARTNERSHIP_ACTIVATED': NotificationType.PARTNERSHIP_ACTIVATED,
      'PARTNERSHIP_DEACTIVATED': NotificationType.PARTNERSHIP_DEACTIVATED,
      'SYSTEM_MAINTENANCE': NotificationType.SYSTEM_MAINTENANCE,
      'GENERAL': NotificationType.GENERAL
    };
    return typeMap[apiType] || NotificationType.GENERAL;
  }

  private buildQueryParams(filters?: any): any {
    if (!filters) return {};
    
    const params: any = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params[key] = filters[key];
      }
    });
    return params;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.status === 404) {
        errorMessage = 'Notification not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid notification data';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server error: ${error.status}`;
      }
    }
    
    if (environment.dev.enableApiLogging) {
      console.error('API Notification Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
