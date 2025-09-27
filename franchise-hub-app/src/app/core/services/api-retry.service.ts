import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, finalize, tap } from 'rxjs/operators';

export interface RetryConfig {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryCondition?: (error: any) => boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiRetryService {
  private readonly defaultConfig: Required<RetryConfig> = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
    retryCondition: (error: any) => {
      // Retry on network errors, 5xx errors, and 429 (rate limit)
      return !error.status || 
             error.status >= 500 || 
             error.status === 429 ||
             error.status === 0; // Network error
    }
  };

  /**
   * Adds retry logic with exponential backoff to an Observable
   */
  withRetry<T>(source: Observable<T>, config?: RetryConfig): Observable<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    return source.pipe(
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;
            
            // Check if we should retry
            if (retryAttempt > finalConfig.maxRetries || !finalConfig.retryCondition(error)) {
              console.error(`❌ API call failed after ${retryAttempt} attempts:`, error);
              return throwError(() => error);
            }
            
            // Calculate delay with exponential backoff
            const delay = Math.min(
              finalConfig.delayMs * Math.pow(finalConfig.backoffMultiplier, index),
              finalConfig.maxDelayMs
            );
            
            console.warn(`🔄 API call failed, retrying in ${delay}ms (attempt ${retryAttempt}/${finalConfig.maxRetries}):`, error);
            
            return timer(delay);
          })
        )
      ),
      tap({
        next: () => console.log('✅ API call succeeded'),
        error: (error) => console.error('❌ API call failed permanently:', error)
      })
    );
  }

  /**
   * Creates a retry configuration for different scenarios
   */
  static createConfig(scenario: 'default' | 'critical' | 'background' | 'realtime'): RetryConfig {
    switch (scenario) {
      case 'critical':
        return {
          maxRetries: 5,
          delayMs: 500,
          backoffMultiplier: 1.5,
          maxDelayMs: 5000
        };
      
      case 'background':
        return {
          maxRetries: 2,
          delayMs: 2000,
          backoffMultiplier: 2,
          maxDelayMs: 8000
        };
      
      case 'realtime':
        return {
          maxRetries: 1,
          delayMs: 200,
          backoffMultiplier: 1,
          maxDelayMs: 200
        };
      
      default:
        return {
          maxRetries: 3,
          delayMs: 1000,
          backoffMultiplier: 2,
          maxDelayMs: 10000
        };
    }
  }
}
