import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-icon">
          <mat-icon>error_outline</mat-icon>
        </div>
        
        <h1 class="error-code">404</h1>
        
        <h2 class="error-title">Page Not Found</h2>
        
        <p class="error-message">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        
        <div class="error-actions">
          <a mat-raised-button color="primary" routerLink="/">
            <mat-icon>home</mat-icon>
            Go Home
          </a>
          
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </div>
        
        <div class="helpful-links">
          <h3>You might be looking for:</h3>
          <ul>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/contact">Contact Us</a></li>
            <li><a routerLink="/faq">FAQ</a></li>
            <li><a routerLink="/register">Register</a></li>
            <li><a routerLink="/login">Login</a></li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .not-found-content {
      text-align: center;
      max-width: 600px;
      background: white;
      padding: 48px 32px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      margin-bottom: 24px;
    }

    .error-icon mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #ff6b6b;
    }

    .error-code {
      font-size: 96px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: #2c3e50;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    .error-title {
      font-size: 32px;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #34495e;
    }

    .error-message {
      font-size: 18px;
      color: #7f8c8d;
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }

    .error-actions a,
    .error-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .helpful-links {
      border-top: 1px solid #ecf0f1;
      padding-top: 32px;
      margin-top: 32px;
    }

    .helpful-links h3 {
      font-size: 18px;
      color: #2c3e50;
      margin: 0 0 16px 0;
    }

    .helpful-links ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
    }

    .helpful-links li {
      margin: 0;
    }

    .helpful-links a {
      color: #3498db;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .helpful-links a:hover {
      color: #2980b9;
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .not-found-container {
        padding: 16px;
        min-height: calc(100vh - 120px);
      }

      .not-found-content {
        padding: 32px 24px;
      }

      .error-code {
        font-size: 72px;
      }

      .error-title {
        font-size: 24px;
      }

      .error-message {
        font-size: 16px;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .error-actions a,
      .error-actions button {
        width: 100%;
        max-width: 200px;
      }

      .helpful-links ul {
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
    }

    @media (max-width: 480px) {
      .not-found-content {
        padding: 24px 16px;
      }

      .error-icon mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
      }

      .error-code {
        font-size: 56px;
      }

      .error-title {
        font-size: 20px;
      }

      .error-message {
        font-size: 14px;
      }
    }

    /* Animation */
    .not-found-content {
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-icon mat-icon {
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
  `]
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
