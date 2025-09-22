import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="about-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1>About FranchiseHub</h1>
            <p class="hero-subtitle">
              Connecting franchise opportunities with passionate entrepreneurs since 2024
            </p>
          </div>
        </div>
      </section>

      <!-- Mission Section -->
      <section class="mission-section">
        <div class="container">
          <div class="mission-content">
            <div class="mission-text">
              <h2>Our Mission</h2>
              <p>
                At FranchiseHub, we believe that successful franchising is built on strong partnerships 
                between franchisors and franchisees. Our mission is to create a transparent, efficient, 
                and supportive platform that connects franchise opportunities with qualified partners.
              </p>
              <p>
                We're committed to democratizing access to franchise opportunities while providing 
                franchisors with the tools they need to find the right partners for their business growth.
              </p>
            </div>
            <div class="mission-image">
              <mat-icon class="mission-icon">business_center</mat-icon>
            </div>
          </div>
        </div>
      </section>

      <!-- Values Section -->
      <section class="values-section">
        <div class="container">
          <h2 class="section-title">Our Values</h2>
          <div class="values-grid">
            <div class="value-card">
              <mat-icon class="value-icon">transparency</mat-icon>
              <h3>Transparency</h3>
              <p>We believe in clear, honest communication and transparent business practices.</p>
            </div>
            <div class="value-card">
              <mat-icon class="value-icon">verified</mat-icon>
              <h3>Quality</h3>
              <p>Every franchise opportunity is carefully vetted to ensure legitimacy and potential.</p>
            </div>
            <div class="value-card">
              <mat-icon class="value-icon">support</mat-icon>
              <h3>Support</h3>
              <p>We provide ongoing support to help both franchisors and franchisees succeed.</p>
            </div>
            <div class="value-card">
              <mat-icon class="value-icon">innovation</mat-icon>
              <h3>Innovation</h3>
              <p>We continuously improve our platform with cutting-edge technology and features.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="team-section">
        <div class="container">
          <h2 class="section-title">Our Team</h2>
          <div class="team-grid">
            <div class="team-member">
              <div class="member-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <h3>John Smith</h3>
              <p class="member-role">CEO & Founder</p>
              <p class="member-bio">
                20+ years in franchise development and business strategy. Former VP at leading franchise company.
              </p>
            </div>
            <div class="team-member">
              <div class="member-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <h3>Sarah Johnson</h3>
              <p class="member-role">CTO</p>
              <p class="member-bio">
                Technology leader with expertise in platform development and scalable systems architecture.
              </p>
            </div>
            <div class="team-member">
              <div class="member-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <h3>Michael Chen</h3>
              <p class="member-role">Head of Business Development</p>
              <p class="member-bio">
                Franchise industry veteran focused on building strategic partnerships and growth opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container">
          <h2 class="section-title">Our Impact</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Franchise Brands</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1,200+</div>
              <div class="stat-label">Successful Matches</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">$50M+</div>
              <div class="stat-label">Franchise Investments Facilitated</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">95%</div>
              <div class="stat-label">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Join Our Community?</h2>
            <p>Whether you're looking to expand your franchise or find the perfect opportunity, we're here to help.</p>
            <div class="cta-actions">
              <a mat-raised-button color="primary" routerLink="/register" [queryParams]="{type: 'partner'}">
                Find Franchises
              </a>
              <a mat-raised-button color="accent" routerLink="/register" [queryParams]="{type: 'business'}">
                List Your Franchise
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .about-page {
      overflow-x: hidden;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 120px 0 80px;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin: 0;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Mission Section */
    .mission-section {
      padding: 80px 0;
    }

    .mission-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 48px;
      align-items: center;
    }

    .mission-text h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #333;
    }

    .mission-text p {
      font-size: 1.1rem;
      line-height: 1.7;
      color: #666;
      margin-bottom: 16px;
    }

    .mission-image {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .mission-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #1976d2;
    }

    /* Values Section */
    .values-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 48px 0;
      color: #333;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
    }

    .value-card {
      text-align: center;
      padding: 32px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .value-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .value-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .value-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Team Section */
    .team-section {
      padding: 80px 0;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .team-member {
      text-align: center;
      padding: 32px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .member-avatar {
      width: 80px;
      height: 80px;
      background: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }

    .member-avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #1976d2;
    }

    .team-member h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .member-role {
      font-weight: 500;
      color: #1976d2;
      margin: 0 0 16px 0;
    }

    .member-bio {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Stats Section */
    .stats-section {
      padding: 80px 0;
      background: #1976d2;
      color: white;
    }

    .stats-section .section-title {
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffd54f;
    }

    .stat-label {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    /* CTA Section */
    .cta-section {
      padding: 80px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
    }

    .cta-content p {
      font-size: 1.25rem;
      margin: 0 0 32px 0;
      opacity: 0.9;
    }

    .cta-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2.5rem;
      }

      .mission-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 32px;
      }

      .mission-text h2 {
        font-size: 2rem;
      }

      .section-title {
        font-size: 2rem;
      }

      .cta-content h2 {
        font-size: 2rem;
      }

      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .cta-actions a {
        width: 100%;
        max-width: 300px;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 80px 0 60px;
      }

      .hero-content h1 {
        font-size: 2rem;
      }

      .mission-section,
      .values-section,
      .team-section,
      .stats-section,
      .cta-section {
        padding: 60px 0;
      }

      .section-title {
        font-size: 1.75rem;
      }
    }
  `]
})
export class AboutComponent {
}
