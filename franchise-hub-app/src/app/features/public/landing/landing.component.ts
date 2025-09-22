import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MockDataService } from '../../../core/services/mock-data.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { FranchiseIconService } from '../../../core/services/franchise-icon.service';
import { Franchise } from '../../../core/models/franchise.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <div class="hero-text">
              <h1 class="hero-title">
                Your Gateway to 
                <span class="highlight">Franchise Success</span>
              </h1>
              <p class="hero-subtitle">
                Connect franchisors with potential partners. Discover franchise opportunities 
                and grow your business network with FranchiseHub.
              </p>
              <div class="hero-actions">
                <a mat-raised-button color="primary" routerLink="/register" [queryParams]="{type: 'partner'}" class="cta-button">
                  <mat-icon>search</mat-icon>
                  Find Franchises
                </a>
                <a mat-raised-button color="accent" routerLink="/register" [queryParams]="{type: 'business'}" class="cta-button">
                  <mat-icon>business</mat-icon>
                  List Your Franchise
                </a>
              </div>
            </div>
            <div class="hero-image">
              <div class="hero-graphic">
                <mat-icon class="hero-icon">handshake</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <h2 class="section-title">Why Choose FranchiseHub?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <mat-icon class="feature-icon">verified</mat-icon>
              <h3>Verified Opportunities</h3>
              <p>All franchise listings are verified and vetted to ensure quality and legitimacy.</p>
            </div>
            <div class="feature-card">
              <mat-icon class="feature-icon">support</mat-icon>
              <h3>Expert Support</h3>
              <p>Get guidance from franchise experts throughout your journey.</p>
            </div>
            <div class="feature-card">
              <mat-icon class="feature-icon">analytics</mat-icon>
              <h3>Data-Driven Insights</h3>
              <p>Make informed decisions with comprehensive franchise analytics and reports.</p>
            </div>
            <div class="feature-card">
              <mat-icon class="feature-icon">security</mat-icon>
              <h3>Secure Platform</h3>
              <p>Your data and transactions are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="how-it-works-section">
        <div class="container">
          <h2 class="section-title">How It Works</h2>
          <div class="steps-container">
            <!-- For Partners -->
            <div class="steps-column">
              <h3 class="steps-title">For Franchise Partners</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>Browse Franchises</h4>
                    <p>Explore verified franchise opportunities that match your interests and budget.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>Submit Applications</h4>
                    <p>Apply to franchises with detailed applications showcasing your qualifications.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>Get Approved</h4>
                    <p>Work with franchisors to finalize agreements and start your business journey.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- For Businesses -->
            <div class="steps-column">
              <h3 class="steps-title">For Franchise Businesses</h3>
              <div class="steps">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>List Your Franchise</h4>
                    <p>Create detailed franchise listings with requirements and opportunities.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>Review Applications</h4>
                    <p>Evaluate qualified candidates and their business proposals efficiently.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>Grow Your Network</h4>
                    <p>Build partnerships with qualified franchisees and expand your business.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Franchises Section -->
      <section class="featured-section">
        <div class="container">
          <h2 class="section-title">Featured Franchise Opportunities</h2>
          <div class="featured-grid">
            <mat-card class="franchise-card" *ngFor="let franchise of featuredFranchises">
              <mat-card-header>
                <div class="franchise-logo">
                  <mat-icon [style.color]="getFranchiseIconColor(franchise.category)">
                    {{getFranchiseIcon(franchise.category)}}
                  </mat-icon>
                </div>
                <mat-card-title>{{franchise.name}}</mat-card-title>
                <mat-card-subtitle>{{franchise.category}}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>{{franchise.description}}</p>
                <div class="franchise-details">
                  <div class="detail">
                    <span class="label">Investment:</span>
                    <span class="value">{{formatCurrency(franchise.initialInvestment.min)}} - {{formatCurrency(franchise.initialInvestment.max)}}</span>
                  </div>
                  <div class="detail">
                    <span class="label">Franchise Fee:</span>
                    <span class="value">{{formatCurrency(franchise.franchiseFee)}}</span>
                  </div>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button color="primary">Learn More</button>
                <button mat-raised-button color="primary">Apply Now</button>
              </mat-card-actions>
            </mat-card>
          </div>
          <div class="view-all-action">
            <a mat-raised-button color="primary" routerLink="/register" [queryParams]="{type: 'partner'}">
              View All Franchises
            </a>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="testimonials-section">
        <div class="container">
          <h2 class="section-title">What Our Users Say</h2>
          <div class="testimonials-grid">
            <div class="testimonial-card" *ngFor="let testimonial of testimonials">
              <div class="testimonial-content">
                <p>"{{testimonial.content}}"</p>
              </div>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="author-info">
                  <h4>{{testimonial.name}}</h4>
                  <p>{{testimonial.role}}, {{testimonial.company}}</p>
                </div>
              </div>
              <div class="testimonial-rating">
                <mat-icon *ngFor="let star of getStars(testimonial.rating)">star</mat-icon>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="stats-section">
        <div class="container">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">500+</div>
              <div class="stat-label">Franchise Opportunities</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1,200+</div>
              <div class="stat-label">Successful Partnerships</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">95%</div>
              <div class="stat-label">Success Rate</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to Start Your Franchise Journey?</h2>
            <p>Join thousands of successful franchise partners and business owners on FranchiseHub.</p>
            <div class="cta-actions">
              <a mat-raised-button color="primary" routerLink="/register" [queryParams]="{type: 'partner'}">
                Get Started as Partner
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
    .landing-page {
      overflow-x: hidden;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 0;
      min-height: 600px;
      display: flex;
      align-items: center;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin: 0 0 24px 0;
      line-height: 1.2;
    }

    .highlight {
      color: #ffd54f;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin: 0 0 32px 0;
      line-height: 1.6;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .cta-button {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .hero-graphic {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      backdrop-filter: blur(10px);
    }

    .hero-icon {
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: #ffd54f;
    }

    /* Section Styles */
    .section-title {
      text-align: center;
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 48px 0;
      color: #333;
    }

    /* Features Section */
    .features-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 32px;
    }

    .feature-card {
      text-align: center;
      padding: 32px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* How It Works Section */
    .how-it-works-section {
      padding: 80px 0;
    }

    .steps-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }

    .steps-title {
      text-align: center;
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0 0 32px 0;
      color: #333;
    }

    .step {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }

    .step-number {
      width: 40px;
      height: 40px;
      background: #1976d2;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-content h4 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .step-content p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    /* Featured Section */
    .featured-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 48px;
    }

    .franchise-card {
      transition: transform 0.3s ease;
    }

    .franchise-card:hover {
      transform: translateY(-4px);
    }

    .franchise-logo {
      width: 48px;
      height: 48px;
      background: #e3f2fd;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .franchise-logo mat-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .franchise-details {
      margin-top: 16px;
    }

    .detail {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    .value {
      font-weight: 600;
      color: #333;
    }

    .view-all-action {
      text-align: center;
    }

    /* Testimonials Section */
    .testimonials-section {
      padding: 80px 0;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 32px;
    }

    .testimonial-card {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .testimonial-content p {
      font-style: italic;
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 0 0 24px 0;
      color: #333;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .author-avatar {
      width: 48px;
      height: 48px;
      background: #e3f2fd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .author-avatar mat-icon {
      color: #1976d2;
    }

    .author-info h4 {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #333;
    }

    .author-info p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .testimonial-rating {
      display: flex;
      gap: 4px;
    }

    .testimonial-rating mat-icon {
      color: #ffc107;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Stats Section */
    .stats-section {
      padding: 80px 0;
      background: #1976d2;
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
      .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 32px;
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .steps-container {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .hero-actions,
      .cta-actions {
        flex-direction: column;
        align-items: center;
      }

      .cta-button {
        width: 100%;
        max-width: 300px;
        justify-content: center;
      }

      .section-title {
        font-size: 2rem;
      }

      .cta-content h2 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 60px 0;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }

      .features-section,
      .how-it-works-section,
      .featured-section,
      .testimonials-section,
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
export class LandingComponent implements OnInit, OnDestroy {
  featuredFranchises: Franchise[] = [];
  private featuredFranchisesSubscription?: Subscription;

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Franchise Owner',
      company: 'Local Restaurant Chain',
      content: 'FranchiseHub made it incredibly easy to find and connect with the perfect franchise opportunity. The platform is intuitive and the support team is outstanding.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Business Development',
      company: 'Fitness Center Network',
      content: 'As a franchisor, FranchiseHub has helped us find qualified partners efficiently. The application process is streamlined and the quality of candidates is excellent.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Franchise Partner',
      company: 'Service Business',
      content: 'The detailed franchise information and transparent fee structure helped me make an informed decision. I\'m now running a successful franchise thanks to FranchiseHub.',
      rating: 5
    }
  ];

  constructor(
    private mockDataService: MockDataService,
    private currencyService: CurrencyService,
    private franchiseIconService: FranchiseIconService
  ) { }

  ngOnInit(): void {
    console.log('🏠 LandingComponent ngOnInit called');
    this.loadFeaturedFranchises();
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.featuredFranchisesSubscription) {
      this.featuredFranchisesSubscription.unsubscribe();
    }
  }

  private loadFeaturedFranchises(): void {
    console.log('🏠 loadFeaturedFranchises called');
    // Load the 3 most recently created franchises from all business accounts
    // Unsubscribe from any existing subscription first
    if (this.featuredFranchisesSubscription) {
      console.log('🏠 Unsubscribing from existing subscription');
      this.featuredFranchisesSubscription.unsubscribe();
    }

    console.log('🏠 Subscribing to getFeaturedFranchises');
    this.featuredFranchisesSubscription = this.mockDataService.getFeaturedFranchises(3).subscribe(franchises => {
      console.log('🏠 LandingComponent received featured franchises:', franchises.length);
      console.log('🏠 Featured franchise details:', franchises.map(f => ({ name: f.name, id: f.id, createdAt: f.createdAt })));

      // Check for duplicates in the received data
      const ids = franchises.map(f => f.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.error('🚨 LandingComponent: Received duplicate franchises with IDs:', duplicateIds);
      }

      this.featuredFranchises = franchises;
      console.log('🏠 featuredFranchises array set to:', this.featuredFranchises.length, 'items');
    });
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  getFranchiseIcon(category: any): string {
    return this.franchiseIconService.getIconForCategory(category);
  }

  getFranchiseIconColor(category: any): string {
    return this.franchiseIconService.getColorForCategory(category);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
