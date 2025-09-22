import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <div class="contact-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container">
          <h1>Contact Us</h1>
          <p>Get in touch with our team. We're here to help you succeed.</p>
        </div>
      </section>

      <!-- Contact Content -->
      <section class="contact-section">
        <div class="container">
          <div class="contact-content">
            <!-- Contact Form -->
            <div class="contact-form-container">
              <mat-card class="contact-form-card">
                <mat-card-header>
                  <mat-card-title>Send us a Message</mat-card-title>
                  <mat-card-subtitle>We'll get back to you within 24 hours</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                    <div class="form-row">
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>First Name</mat-label>
                        <input matInput formControlName="firstName" placeholder="Your first name">
                        <mat-error *ngIf="contactForm.get('firstName')?.hasError('required')">
                          First name is required
                        </mat-error>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline" class="half-width">
                        <mat-label>Last Name</mat-label>
                        <input matInput formControlName="lastName" placeholder="Your last name">
                        <mat-error *ngIf="contactForm.get('lastName')?.hasError('required')">
                          Last name is required
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email" placeholder="your@email.com">
                      <mat-icon matSuffix>email</mat-icon>
                      <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                        Email is required
                      </mat-error>
                      <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                        Please enter a valid email address
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Phone Number</mat-label>
                      <input matInput type="tel" formControlName="phone" placeholder="(555) 123-4567">
                      <mat-icon matSuffix>phone</mat-icon>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Company</mat-label>
                      <input matInput formControlName="company" placeholder="Your company name">
                      <mat-icon matSuffix>business</mat-icon>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>I am a</mat-label>
                      <mat-select formControlName="userType">
                        <mat-option value="business">Business Owner / Franchisor</mat-option>
                        <mat-option value="partner">Potential Franchise Partner</mat-option>
                        <mat-option value="other">Other</mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Subject</mat-label>
                      <input matInput formControlName="subject" placeholder="What can we help you with?">
                      <mat-error *ngIf="contactForm.get('subject')?.hasError('required')">
                        Subject is required
                      </mat-error>
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Message</mat-label>
                      <textarea 
                        matInput 
                        formControlName="message" 
                        rows="5" 
                        placeholder="Tell us more about your inquiry..."></textarea>
                      <mat-error *ngIf="contactForm.get('message')?.hasError('required')">
                        Message is required
                      </mat-error>
                    </mat-form-field>
                    
                    <button 
                      mat-raised-button 
                      color="primary" 
                      type="submit"
                      class="submit-button"
                      [disabled]="contactForm.invalid || isSubmitting">
                      <mat-icon *ngIf="!isSubmitting">send</mat-icon>
                      <span *ngIf="!isSubmitting">Send Message</span>
                      <span *ngIf="isSubmitting">Sending...</span>
                    </button>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Contact Information -->
            <div class="contact-info">
              <div class="info-card">
                <mat-icon class="info-icon">location_on</mat-icon>
                <h3>Our Office</h3>
                <p>
                  123 Business Avenue<br>
                  Suite 456<br>
                  New York, NY 10001
                </p>
              </div>
              
              <div class="info-card">
                <mat-icon class="info-icon">phone</mat-icon>
                <h3>Phone</h3>
                <p>
                  <a href="tel:+1-800-FRANCHISE">1-800-FRANCHISE</a><br>
                  <a href="tel:+1-555-123-4567">+1 (555) 123-4567</a>
                </p>
              </div>
              
              <div class="info-card">
                <mat-icon class="info-icon">email</mat-icon>
                <h3>Email</h3>
                <p>
                  <a href="mailto:support@franchisehub.com">support&#64;franchisehub.com</a><br>
                  <a href="mailto:partnerships@franchisehub.com">partnerships&#64;franchisehub.com</a>
                </p>
              </div>
              
              <div class="info-card">
                <mat-icon class="info-icon">schedule</mat-icon>
                <h3>Business Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM EST<br>
                  Saturday: 10:00 AM - 4:00 PM EST<br>
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contact-page {
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

    /* Contact Section */
    .contact-section {
      padding: 80px 0;
      background: #f8f9fa;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 48px;
    }

    /* Contact Form */
    .contact-form-card {
      padding: 0;
    }

    .contact-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .submit-button {
      margin-top: 16px;
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    /* Contact Information */
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .info-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .info-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }

    .info-card p {
      color: #666;
      line-height: 1.6;
      margin: 0;
    }

    .info-card a {
      color: #1976d2;
      text-decoration: none;
    }

    .info-card a:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .hero-section h1 {
        font-size: 2.5rem;
      }

      .contact-content {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .contact-info {
        order: -1;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        padding: 80px 0 60px;
      }

      .hero-section h1 {
        font-size: 2rem;
      }

      .contact-section {
        padding: 60px 0;
      }

      .contact-form {
        padding: 16px;
      }
    }
  `]
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      userType: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.snackBar.open('Message sent successfully! We\'ll get back to you soon.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.contactForm.reset();
      }, 2000);
    }
  }
}
