import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- Main Footer Content -->
        <div class="footer-content">
          <!-- Company Info -->
          <div class="footer-section">
            <div class="footer-brand">
              <mat-icon class="brand-icon">business</mat-icon>
              <h3>FranchiseHub</h3>
            </div>
            <p class="footer-description">
              Your gateway to franchise success. Connecting franchisors with potential partners 
              to build thriving business relationships.
            </p>
            <div class="social-links">
              <a href="#" mat-icon-button aria-label="Facebook">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="Twitter">
                <mat-icon>twitter</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="LinkedIn">
                <mat-icon>linkedin</mat-icon>
              </a>
              <a href="#" mat-icon-button aria-label="Instagram">
                <mat-icon>instagram</mat-icon>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/about">About Us</a></li>
              <li><a routerLink="/contact">Contact Us</a></li>
              <li><a routerLink="/faq">FAQ</a></li>
              <li><a routerLink="/register">Get Started</a></li>
            </ul>
          </div>

          <!-- For Business -->
          <div class="footer-section">
            <h4>For Business</h4>
            <ul class="footer-links">
              <li><a routerLink="/register" [queryParams]="{type: 'business'}">List Your Franchise</a></li>
              <li><a href="#business-features">Business Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#success-stories">Success Stories</a></li>
            </ul>
          </div>

          <!-- For Partners -->
          <div class="footer-section">
            <h4>For Partners</h4>
            <ul class="footer-links">
              <li><a routerLink="/register" [queryParams]="{type: 'partner'}">Find Franchises</a></li>
              <li><a href="#partner-resources">Partner Resources</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </div>

          <!-- Legal & Support -->
          <div class="footer-section">
            <h4>Legal & Support</h4>
            <ul class="footer-links">
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/terms">Terms & Conditions</a></li>
              <li><a href="mailto:support@franchisehub.com">Support</a></li>
              <li><a href="tel:+1-800-FRANCHISE">1-800-FRANCHISE</a></li>
            </ul>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="footer-bottom-content">
            <p class="copyright">
              © {{currentYear}} FranchiseHub. All rights reserved.
            </p>
            <div class="footer-bottom-links">
              <a routerLink="/privacy">Privacy</a>
              <span class="separator">|</span>
              <a routerLink="/terms">Terms</a>
              <span class="separator">|</span>
              <a routerLink="/contact">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #263238;
      color: #ffffff;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 16px 24px;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
      margin-bottom: 32px;
    }

    .footer-section h3,
    .footer-section h4 {
      margin: 0 0 16px 0;
      color: #ffffff;
      font-weight: 500;
    }

    .footer-section h3 {
      font-size: 24px;
    }

    .footer-section h4 {
      font-size: 18px;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    .brand-icon {
      margin-right: 8px;
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #4fc3f7;
    }

    .footer-description {
      color: #b0bec5;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .social-links {
      display: flex;
      gap: 8px;
    }

    .social-links a {
      color: #b0bec5;
      transition: color 0.3s ease;
    }

    .social-links a:hover {
      color: #4fc3f7;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 12px;
    }

    .footer-links a {
      color: #b0bec5;
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 14px;
    }

    .footer-links a:hover {
      color: #4fc3f7;
    }

    .footer-bottom {
      padding-top: 24px;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .copyright {
      color: #78909c;
      margin: 0;
      font-size: 14px;
    }

    .footer-bottom-links {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .footer-bottom-links a {
      color: #78909c;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-bottom-links a:hover {
      color: #4fc3f7;
    }

    .separator {
      color: #546e7a;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .footer-container {
        padding: 32px 8px 16px;
      }

      .footer-content {
        grid-template-columns: 1fr;
        gap: 24px;
        margin-bottom: 24px;
      }

      .footer-bottom-content {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .footer-section:first-child {
        text-align: center;
      }

      .social-links {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .footer-container {
        padding: 24px 8px 12px;
      }

      .footer-content {
        gap: 20px;
      }

      .footer-section h4 {
        font-size: 16px;
      }

      .footer-brand h3 {
        font-size: 20px;
      }

      .brand-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .footer {
        background-color: #1a1a1a;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
