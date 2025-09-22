import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MockDataService } from '../../../core/services/mock-data.service';
import { FranchiseIconService } from '../../../core/services/franchise-icon.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { Franchise } from '../../../core/models/franchise.model';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="browse-container">
      <div class="browse-header">
        <h1>Browse Franchise Opportunities</h1>
        <p>Discover the perfect franchise opportunity for your entrepreneurial journey.</p>
      </div>

      <!-- Search and Filters -->
      <div class="search-filters">
        <mat-card>
          <mat-card-content>
            <div class="filter-row">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search franchises</mat-label>
                <input matInput [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by name or category">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilters()">
                  <mat-option value="">All Categories</mat-option>
                  <mat-option *ngFor="let category of categories" [value]="category">
                    {{category}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Investment Range</mat-label>
                <mat-select [(ngModel)]="selectedInvestmentRange" (selectionChange)="applyFilters()">
                  <mat-option value="">Any Amount</mat-option>
                  <mat-option value="0-100000">Under $100K</mat-option>
                  <mat-option value="100000-250000">$100K - $250K</mat-option>
                  <mat-option value="250000-500000">$250K - $500K</mat-option>
                  <mat-option value="500000-1000000">$500K+</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Results Summary -->
      <div class="results-summary">
        <p>{{filteredFranchises.length}} franchise{{filteredFranchises.length !== 1 ? 's' : ''}} found</p>
      </div>

      <!-- Franchise Cards -->
      <div class="franchises-grid">
        <mat-card *ngFor="let franchise of filteredFranchises" class="franchise-card">
          <div class="franchise-image">
            <div *ngIf="!hasValidImage(franchise)" class="franchise-icon-placeholder">
              <mat-icon [style.color]="getFranchiseIconColor(franchise.category)"
                        [style.font-size.px]="48"
                        [style.width.px]="48"
                        [style.height.px]="48">
                {{getFranchiseIcon(franchise.category)}}
              </mat-icon>
            </div>
            <img *ngIf="hasValidImage(franchise)"
                 [src]="franchise.images[0]"
                 [alt]="franchise.name">
          </div>

          <mat-card-header>
            <mat-card-title>{{franchise.name}}</mat-card-title>
            <mat-card-subtitle>{{franchise.category}}</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="franchise-description">{{franchise.description}}</p>

            <div class="franchise-details">
              <div class="detail-item">
                <mat-icon>attach_money</mat-icon>
                <span>Investment: {{formatCurrency(franchise.initialInvestment.min)}} - {{formatCurrency(franchise.initialInvestment.max)}}</span>
              </div>

              <div class="detail-item">
                <mat-icon>payment</mat-icon>
                <span>Franchise Fee: {{formatCurrency(franchise.franchiseFee)}}</span>
              </div>

              <div class="detail-item">
                <mat-icon>trending_up</mat-icon>
                <span>Royalty: {{franchise.royaltyFee}}%</span>
              </div>

              <div class="detail-item">
                <mat-icon>location_on</mat-icon>
                <span>Territory: {{franchise.territories[0]}}</span>
              </div>
            </div>

            <div class="support-chips">
              <mat-chip>{{franchise.support.training}}</mat-chip>
              <mat-chip>{{franchise.support.marketing}}</mat-chip>
              <mat-chip>{{franchise.support.operations}}</mat-chip>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button (click)="viewDetails(franchise)">
              <mat-icon>info</mat-icon>
              View Details
            </button>
            <button mat-raised-button color="primary" (click)="applyToFranchise(franchise)">
              <mat-icon>send</mat-icon>
              Apply Now
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- No Results -->
      <div *ngIf="filteredFranchises.length === 0" class="no-results">
        <mat-icon>search_off</mat-icon>
        <h3>No franchises found</h3>
        <p>Try adjusting your search criteria or browse all available opportunities.</p>
        <button mat-button (click)="clearFilters()">Clear Filters</button>
      </div>
    </div>
  `,
  styles: [`
    .browse-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .browse-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .browse-header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .browse-header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .search-filters {
      margin-bottom: 24px;
    }

    .filter-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      min-width: 300px;
    }

    .results-summary {
      margin-bottom: 24px;
      color: #666;
    }

    .franchises-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .franchise-card {
      height: fit-content;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .franchise-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .franchise-image {
      height: 200px;
      overflow: hidden;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .franchise-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .franchise-icon-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px 8px 0 0;
    }

    .franchise-icon-placeholder mat-icon {
      opacity: 0.8;
    }

    .franchise-description {
      margin: 16px 0;
      color: #666;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .franchise-details {
      margin: 16px 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #555;
      font-size: 14px;
    }

    .detail-item mat-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #1976d2;
    }

    .support-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 16px 0;
    }

    .support-chips mat-chip {
      font-size: 12px;
      height: 28px;
    }

    .more-chip {
      background-color: #e0e0e0 !important;
      color: #666 !important;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-results h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .no-results p {
      margin: 0 0 24px 0;
    }

    @media (max-width: 768px) {
      .browse-container {
        padding: 16px;
      }

      .filter-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .search-field {
        min-width: unset;
      }

      .franchises-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .franchise-card {
        margin-bottom: 16px;
      }
    }

    @media (max-width: 480px) {
      .franchise-image {
        height: 150px;
      }

      .detail-item {
        font-size: 13px;
      }

      .support-chips mat-chip {
        font-size: 11px;
        height: 24px;
      }
    }
  `]
})
export class BrowseComponent implements OnInit {
  franchises: Franchise[] = [];
  filteredFranchises: Franchise[] = [];
  categories: string[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  selectedInvestmentRange: string = '';

  private router = inject(Router);

  constructor(
    private mockDataService: MockDataService,
    private dialog: MatDialog,
    private franchiseIconService: FranchiseIconService,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.loadFranchises();
  }

  private loadFranchises() {
    this.mockDataService.getFranchises().subscribe(franchises => {
      this.franchises = franchises.filter(f => f.isActive);
      this.filteredFranchises = [...this.franchises];
      this.extractCategories();
    });
  }

  private extractCategories() {
    const categorySet = new Set(this.franchises.map(f => f.category));
    this.categories = Array.from(categorySet).sort();
  }

  applyFilters() {
    this.filteredFranchises = this.franchises.filter(franchise => {
      // Search term filter
      const matchesSearch = !this.searchTerm ||
        franchise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        franchise.category.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        franchise.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = !this.selectedCategory ||
        franchise.category === this.selectedCategory;

      // Investment range filter
      const matchesInvestment = !this.selectedInvestmentRange ||
        this.isInInvestmentRange(franchise, this.selectedInvestmentRange);

      return matchesSearch && matchesCategory && matchesInvestment;
    });
  }

  private isInInvestmentRange(franchise: Franchise, range: string): boolean {
    const [min, max] = range.split('-').map(Number);
    const franchiseMin = franchise.initialInvestment.min;
    const franchiseMax = franchise.initialInvestment.max;

    if (max) {
      return franchiseMin >= min && franchiseMax <= max;
    } else {
      return franchiseMin >= min;
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedInvestmentRange = '';
    this.applyFilters();
  }

  viewDetails(franchise: Franchise) {
    // TODO: Open franchise details dialog or navigate to details page
    console.log('View details for:', franchise.name);
  }

  applyToFranchise(franchise: Franchise) {
    // Navigate to application form with franchise pre-selected
    this.router.navigate(['/partner/applications/new', franchise.id]);
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  /**
   * Get the Material Design icon for a franchise category
   */
  getFranchiseIcon(category: any): string {
    return this.franchiseIconService.getIconForCategory(category);
  }

  /**
   * Get the color for a franchise category
   */
  getFranchiseIconColor(category: any): string {
    return this.franchiseIconService.getColorForCategory(category);
  }

  /**
   * Check if franchise has a valid image
   */
  hasValidImage(franchise: any): boolean {
    return franchise.images && franchise.images.length > 0 &&
           this.franchiseIconService.hasValidImage(franchise.images[0]);
  }
}
