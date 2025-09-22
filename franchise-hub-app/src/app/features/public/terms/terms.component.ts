import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="terms-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1>Terms & Conditions</h1>
          <p>Last updated: January 1, 2024</p>
        </div>
      </section>

      <!-- Terms Content -->
      <section class="terms-section">
        <div class="container">
          <div class="terms-content">
            <div class="section">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using FranchiseHub, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>

            <div class="section">
              <h2>2. Use License</h2>
              <p>Permission is granted to temporarily use FranchiseHub for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul>
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>

            <div class="section">
              <h2>3. Platform Fees</h2>
              <p>FranchiseHub charges a 5% platform fee on successful franchise transactions:</p>
              <ul>
                <li>2.5% paid by the franchise business</li>
                <li>2.5% paid by the franchise partner</li>
                <li>Fees are charged only upon successful completion of franchise agreements</li>
                <li>All fees are clearly disclosed before any transaction</li>
              </ul>
            </div>

            <div class="section">
              <h2>4. User Responsibilities</h2>
              <p>Users are responsible for:</p>
              <ul>
                <li>Providing accurate and truthful information</li>
                <li>Maintaining the confidentiality of account credentials</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Respecting the intellectual property rights of others</li>
              </ul>
            </div>

            <div class="section">
              <h2>5. Prohibited Uses</h2>
              <p>You may not use our service:</p>
              <ul>
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              </ul>
            </div>

            <div class="section">
              <h2>6. Disclaimer</h2>
              <p>The materials on FranchiseHub are provided on an 'as is' basis. FranchiseHub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
            </div>

            <div class="section">
              <h2>7. Limitations</h2>
              <p>In no event shall FranchiseHub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FranchiseHub, even if FranchiseHub or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
            </div>

            <div class="section">
              <h2>8. Accuracy of Materials</h2>
              <p>The materials appearing on FranchiseHub could include technical, typographical, or photographic errors. FranchiseHub does not warrant that any of the materials on its website are accurate, complete, or current.</p>
            </div>

            <div class="section">
              <h2>9. Modifications</h2>
              <p>FranchiseHub may revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.</p>
            </div>

            <div class="section">
              <h2>10. Governing Law</h2>
              <p>These terms and conditions are governed by and construed in accordance with the laws of New York and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
            </div>

            <div class="section">
              <h2>11. Contact Information</h2>
              <p>If you have any questions about these Terms & Conditions, please contact us at:</p>
              <p>
                Email: legal&#64;franchisehub.com<br>
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
    .terms-page {
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

    /* Terms Section */
    .terms-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .terms-content {
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

      .terms-content {
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

      .terms-section {
        padding: 60px 0;
      }

      .terms-content {
        padding: 24px 16px;
      }

      .section h2 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class TermsComponent {
}
