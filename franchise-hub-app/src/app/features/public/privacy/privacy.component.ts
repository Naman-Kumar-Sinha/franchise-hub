import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1>Privacy Policy</h1>
          <p>Last updated: January 1, 2024</p>
        </div>
      </section>

      <!-- Privacy Content -->
      <section class="privacy-section">
        <div class="container">
          <div class="privacy-content">
            <div class="section">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, submit applications, or contact us for support.</p>
              <ul>
                <li>Personal information (name, email, phone number)</li>
                <li>Business information (company name, role, experience)</li>
                <li>Financial information (for franchise applications)</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>

            <div class="section">
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process franchise applications and facilitate connections</li>
                <li>Communicate with you about our services</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div class="section">
              <h2>3. Information Sharing</h2>
              <p>We may share your information in the following circumstances:</p>
              <ul>
                <li>With franchise partners when you submit applications</li>
                <li>With service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transaction</li>
              </ul>
            </div>

            <div class="section">
              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </div>

            <div class="section">
              <h2>5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </div>

            <div class="section">
              <h2>6. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.</p>
            </div>

            <div class="section">
              <h2>7. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <p>
                Email: privacy&#64;franchisehub.com<br>
                Phone: 1-800-FRANCHISE<br>
                Address: 123 Business Avenue, Suite 456, New York, NY 10001
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .privacy-page {
      overflow-x: hidden;
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      padding: 120px 0 80px;
      text-align: center;
    }

    .hero-section h1 {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .hero-section p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    /* Privacy Section */
    .privacy-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .privacy-content {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 48px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .section {
      margin-bottom: 32px;
    }

    .section:last-child {
      margin-bottom: 0;
    }

    .section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      color: #333;
    }

    .section p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .section ul {
      color: #666;
      line-height: 1.6;
      padding-left: 20px;
    }

    .section li {
      margin-bottom: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-section h1 {
        font-size: 2.5rem;
      }

      .privacy-content {
        padding: 32px 24px;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 80px 0 60px;
      }

      .hero-section h1 {
        font-size: 2rem;
      }

      .privacy-section {
        padding: 60px 0;
      }

      .privacy-content {
        padding: 24px 16px;
      }

      .section h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class PrivacyComponent {
}
