import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule
  ],
  template: `
    <div class="faq-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about FranchiseHub</p>
        </div>
      </section>

      <!-- FAQ Content -->
      <section class="faq-section">
        <div class="container">
          <div class="faq-categories">
            <!-- General Questions -->
            <div class="faq-category">
              <h2>General Questions</h2>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let faq of generalFaqs">
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{faq.question}}</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p [innerHTML]="faq.answer"></p>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <!-- For Partners -->
            <div class="faq-category">
              <h2>For Franchise Partners</h2>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let faq of partnerFaqs">
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{faq.question}}</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p [innerHTML]="faq.answer"></p>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <!-- For Businesses -->
            <div class="faq-category">
              <h2>For Franchise Businesses</h2>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let faq of businessFaqs">
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{faq.question}}</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p [innerHTML]="faq.answer"></p>
                </mat-expansion-panel>
              </mat-accordion>
            </div>

            <!-- Pricing & Fees -->
            <div class="faq-category">
              <h2>Pricing & Fees</h2>
              <mat-accordion>
                <mat-expansion-panel *ngFor="let faq of pricingFaqs">
                  <mat-expansion-panel-header>
                    <mat-panel-title>{{faq.question}}</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p [innerHTML]="faq.answer"></p>
                </mat-expansion-panel>
              </mat-accordion>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .faq-page {
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
      font-size: 1.25rem;
      opacity: 0.9;
      margin: 0;
    }

    /* FAQ Section */
    .faq-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .faq-categories {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-category {
      margin-bottom: 48px;
    }

    .faq-category h2 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #333;
      text-align: center;
    }

    .faq-category:last-child {
      margin-bottom: 0;
    }

    mat-accordion {
      background: transparent;
    }

    mat-expansion-panel {
      background: white;
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    mat-expansion-panel:last-child {
      margin-bottom: 0;
    }

    mat-panel-title {
      font-weight: 500;
      color: #333;
    }

    mat-expansion-panel-content p {
      color: #666;
      line-height: 1.6;
      margin: 16px 0 0 0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-section h1 {
        font-size: 2.5rem;
      }

      .faq-category h2 {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 80px 0 60px;
      }

      .hero-section h1 {
        font-size: 2rem;
      }

      .faq-section {
        padding: 60px 0;
      }

      .faq-category h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class FaqComponent {
  generalFaqs = [
    {
      question: 'What is FranchiseHub?',
      answer: 'FranchiseHub is a comprehensive platform that connects franchise opportunities with qualified partners. We help franchisors find the right partners and help potential franchisees discover suitable franchise opportunities.'
    },
    {
      question: 'How does FranchiseHub work?',
      answer: 'Our platform allows franchise businesses to list their opportunities and potential partners to browse and apply to franchises that match their interests and qualifications. We facilitate the entire process from discovery to partnership.'
    },
    {
      question: 'Is FranchiseHub free to use?',
      answer: 'Registration and browsing are free. We charge a 5% platform fee on successful transactions, split equally between the business and partner (2.5% each).'
    }
  ];

  partnerFaqs = [
    {
      question: 'How do I find franchise opportunities?',
      answer: 'After registering as a partner, you can browse our extensive database of verified franchise opportunities. Use our search and filter tools to find franchises that match your budget, interests, and location preferences.'
    },
    {
      question: 'What information do I need to apply?',
      answer: 'You\'ll need to provide personal information, financial details (net worth, liquid capital, credit score), business experience, and your preferences for location and timeline.'
    },
    {
      question: 'How long does the application process take?',
      answer: 'The application review process typically takes 5-10 business days. However, this can vary depending on the specific franchise and their review process.'
    }
  ];

  businessFaqs = [
    {
      question: 'How do I list my franchise?',
      answer: 'Register as a business user and complete your franchise listing with detailed information about your opportunity, requirements, fees, and support provided.'
    },
    {
      question: 'How are applicants vetted?',
      answer: 'All applicants go through our verification process, and you have full control over reviewing applications and selecting qualified candidates based on your criteria.'
    },
    {
      question: 'Can I manage multiple franchise brands?',
      answer: 'Yes, you can list and manage multiple franchise opportunities from your business dashboard.'
    }
  ];

  pricingFaqs = [
    {
      question: 'What are the platform fees?',
      answer: 'We charge a 5% platform fee on successful transactions. This fee is split equally: 2.5% paid by the business and 2.5% paid by the partner.'
    },
    {
      question: 'When are fees charged?',
      answer: 'Fees are only charged when a franchise agreement is successfully completed and the initial franchise fee is paid.'
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No, we believe in transparency. The 5% platform fee is the only fee we charge. There are no listing fees, subscription fees, or hidden charges.'
    }
  ];
}
