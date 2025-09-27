import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';

import { FranchiseDialogComponent, FranchiseDialogData } from './franchise-dialog/franchise-dialog.component';

import { Franchise, FranchiseCategory, FranchiseFormData, FranchisePerformanceMetrics, FranchiseManagementFilters } from '../../../core/models/franchise.model';
import { FranchiseService } from '../../../core/services/franchise.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface FranchiseMetrics {
  totalApplications: number;
  approvedApplications: number;
  conversionRate: number;
  totalRevenue: number;
  averageTimeToPartnership: number;
  monthlyGrowth: number;
  activePartnerships: number;
}
import { FranchiseDetailsDialogComponent } from './franchise-details-dialog/franchise-details-dialog.component';

@Component({
  selector: 'app-franchises',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="franchises-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <h1>Franchise Management</h1>
          <p>Manage your franchise listings, track performance, and monitor applications</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="openCreateDialog()">
            <mat-icon>add</mat-icon>
            Create New Franchise
          </button>
        </div>
      </div>

      <!-- Filters and Search Section -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search franchises</mat-label>
              <input matInput
                     placeholder="Search by name or description"
                     [(ngModel)]="searchQuery"
                     (input)="applyFilters()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{category.label}}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="">All Status</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Bulk Actions Section -->
      <div class="bulk-actions" *ngIf="selection.hasValue()">
        <mat-card>
          <mat-card-content>
            <div class="bulk-actions-content">
              <span>{{selection.selected.length}} franchise(s) selected</span>
              <div class="bulk-buttons">
                <button mat-button color="primary" (click)="bulkActivate()">
                  <mat-icon>check_circle</mat-icon>
                  Activate Selected
                </button>
                <button mat-button color="warn" (click)="bulkDeactivate()">
                  <mat-icon>cancel</mat-icon>
                  Deactivate Selected
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Franchises Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="franchises-table">

              <!-- Selection Column -->
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox (change)="$event ? masterToggle() : null"
                                [checked]="selection.hasValue() && isAllSelected()"
                                [indeterminate]="selection.hasValue() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let franchise">
                  <mat-checkbox (click)="$event.stopPropagation()"
                                (change)="$event ? selection.toggle(franchise) : null"
                                [checked]="selection.isSelected(franchise)">
                  </mat-checkbox>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let franchise">
                  <div class="franchise-name-cell">
                    <div class="franchise-info">
                      <h4>{{franchise.name}}</h4>
                      <p>{{franchise.description | slice:0:60}}{{franchise.description.length > 60 ? '...' : ''}}</p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let franchise">
                  <mat-chip [style.background-color]="getCategoryColor(franchise.category)">
                    {{getCategoryLabel(franchise.category)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let franchise">
                  <mat-slide-toggle
                    [checked]="franchise.isActive"
                    (change)="toggleFranchiseStatus(franchise, $event.checked)"
                    [color]="'primary'">
                    {{franchise.isActive ? 'Active' : 'Inactive'}}
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Investment Column -->
              <ng-container matColumnDef="investment">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Investment Required</th>
                <td mat-cell *matCellDef="let franchise">
                  <div class="investment-info">
                    <strong>{{formatCurrency(franchise.initialInvestment.min)}} - {{formatCurrency(franchise.initialInvestment.max)}}</strong>
                    <small>Franchise Fee: {{formatCurrency(franchise.franchiseFee)}}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Performance Column -->
              <ng-container matColumnDef="performance">
                <th mat-header-cell *matHeaderCellDef>Performance</th>
                <td mat-cell *matCellDef="let franchise">
                  <div class="performance-metrics" *ngIf="getPerformanceMetrics(franchise.id) as metrics">
                    <div class="metric">
                      <span class="metric-label">Applications:</span>
                      <span class="metric-value">{{metrics.totalApplications}}</span>
                    </div>
                    <div class="metric">
                      <span class="metric-label">Conversion:</span>
                      <span class="metric-value">{{metrics.conversionRate | number:'1.0-1'}}%</span>
                    </div>
                    <mat-progress-bar
                      mode="determinate"
                      [value]="metrics.conversionRate"
                      [color]="metrics.conversionRate > 50 ? 'primary' : 'warn'">
                    </mat-progress-bar>
                  </div>
                  <div class="performance-loading" *ngIf="!getPerformanceMetrics(franchise.id)">
                    <span>Loading metrics...</span>
                  </div>
                </td>
              </ng-container>

              <!-- Created Date Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                <td mat-cell *matCellDef="let franchise">
                  {{franchise.createdAt | date:'mediumDate'}}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let franchise">
                  <button mat-icon-button [matMenuTriggerFor]="actionMenu" (click)="$event.stopPropagation()">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #actionMenu="matMenu">
                    <button mat-menu-item (click)="viewDetails(franchise)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                    <button mat-menu-item (click)="editFranchise(franchise)">
                      <mat-icon>edit</mat-icon>
                      Edit
                    </button>
                    <button mat-menu-item (click)="duplicateFranchise(franchise)">
                      <mat-icon>content_copy</mat-icon>
                      Duplicate
                    </button>
                    <mat-divider></mat-divider>
                    <button mat-menu-item (click)="deleteFranchise(franchise)" class="delete-action">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  (click)="viewDetails(row)"
                  class="franchise-row"></tr>
            </table>

            <mat-paginator [pageSizeOptions]="[5, 10, 20, 50]"
                           showFirstLastButtons>
            </mat-paginator>
          </div>
        </mat-card-content>
      </mat-card>
    </div>`,
  styles: [`
    .franchises-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 28px;
      font-weight: 500;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
    }

    .bulk-actions {
      margin-bottom: 16px;
    }

    .bulk-actions-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .bulk-buttons {
      display: flex;
      gap: 12px;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .table-container {
      overflow-x: auto;
    }

    .franchises-table {
      width: 100%;
      min-width: 1000px;
    }

    .franchise-row {
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .franchise-row:hover {
      background-color: #f5f5f5;
    }

    .franchise-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .franchise-info h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .franchise-info p {
      margin: 0;
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }

    .investment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .investment-info strong {
      font-size: 14px;
      color: #333;
    }

    .investment-info small {
      font-size: 12px;
      color: #666;
    }

    .performance-metrics {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 120px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
    }

    .metric-label {
      color: #666;
    }

    .metric-value {
      color: #333;
      font-weight: 500;
    }

    .delete-action {
      color: #f44336;
    }

    .delete-action mat-icon {
      color: #f44336;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .franchises-container {
        padding: 16px;
      }

      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .bulk-actions-content {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
      }

      .bulk-buttons {
        justify-content: center;
      }

      .table-container {
        margin: 0 -16px;
      }

      .franchises-table {
        min-width: 800px;
      }
    }
  `]
})
export class FranchisesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Franchise>();
  selection = new SelectionModel<Franchise>(true, []);

  displayedColumns: string[] = [
    'select', 'name', 'category', 'status', 'investment',
    'performance', 'createdAt', 'actions'
  ];

  // Filter properties
  searchQuery = '';
  selectedCategory = '';
  selectedStatus: boolean | '' = '';

  // Data properties
  franchises: Franchise[] = [];
  currentUser: any;
  performanceCache = new Map<string, FranchiseMetrics>();

  // Category options
  categories = [
    { value: 'FOOD_BEVERAGE', label: 'Food & Beverage' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'SERVICES', label: 'Services' },
    { value: 'HEALTH_FITNESS', label: 'Health & Fitness' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'AUTOMOTIVE', label: 'Automotive' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private franchiseService: FranchiseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadFranchises();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadCurrentUser() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadFranchises() {
    // Get current user if not already available
    if (!this.currentUser) {
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.loadFranchises(); // Recursive call once user is available
        }
      });
      return;
    }

    console.log('🏢 Business Franchises - Current user ID:', this.currentUser.id);
    // Use hybrid franchise service for real-time updates
    const filters: FranchiseManagementFilters = {
      businessOwnerId: this.currentUser.id
    };

    this.franchiseService.getFranchises(filters).subscribe({
      next: (franchises) => {
        console.log('🏢 Business Franchises - Franchises received:', franchises.length);
        console.log('🏢 Business Franchises - Franchise names:', franchises.map(f => f.name));

        this.franchises = franchises
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first

        console.log('🏢 Business Franchises - Filtered franchises for user:', this.franchises.length);

        this.dataSource.data = this.franchises;
        this.loadPerformanceMetrics();
      },
      error: (error) => {
        console.error('❌ Error loading franchises:', error);
        this.showSnackBar('Error loading franchises. Please try again.');
      }
    });
  }

  private loadPerformanceMetrics() {
    this.franchises.forEach(franchise => {
      // Only load if not already cached
      if (!this.performanceCache.has(franchise.id)) {
        this.franchiseService.getFranchisePerformanceMetrics(franchise.id).pipe(
          catchError((error: any) => {
            console.error('Error loading performance metrics for franchise:', franchise.id, error);
            // Return default metrics on error
            return of<FranchiseMetrics>({
              totalApplications: 0,
              approvedApplications: 0,
              conversionRate: 0,
              totalRevenue: 0,
              averageTimeToPartnership: 0,
              monthlyGrowth: 0,
              activePartnerships: 0
            });
          })
        ).subscribe(metrics => {
          this.performanceCache.set(franchise.id, metrics);
        });
      }
    });
  }

  // Filter and search methods
  applyFilters() {
    let filtered = [...this.franchises];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(f => f.category === this.selectedCategory);
    }

    // Apply status filter
    if (this.selectedStatus !== '') {
      filtered = filtered.filter(f => f.isActive === this.selectedStatus);
    }

    this.dataSource.data = filtered;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.dataSource.data = this.franchises;
  }

  // Selection methods
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // Bulk actions
  bulkActivate() {
    const selectedIds = this.selection.selected.map(f => f.id);
    this.franchiseService.bulkUpdateFranchiseStatus(selectedIds, true).subscribe(() => {
      this.selection.selected.forEach(franchise => {
        franchise.isActive = true;
      });
      this.selection.clear();
      this.showSnackBar('Selected franchises have been activated');
    });
  }

  bulkDeactivate() {
    const selectedIds = this.selection.selected.map(f => f.id);
    this.franchiseService.bulkUpdateFranchiseStatus(selectedIds, false).subscribe(() => {
      this.selection.selected.forEach(franchise => {
        franchise.isActive = false;
      });
      this.selection.clear();
      this.showSnackBar('Selected franchises have been deactivated');
    });
  }

  // Franchise actions
  openCreateDialog() {
    const dialogRef = this.dialog.open(FranchiseDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { mode: 'create' } as FranchiseDialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('✅ Franchise created, refreshing list...', result);
        // Refresh the franchise list to show the newly created franchise
        this.loadFranchises();
        this.showSnackBar(`${result.name} has been created successfully!`);
      }
    });
  }

  viewDetails(franchise: Franchise) {
    const dialogRef = this.dialog.open(FranchiseDetailsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { franchise }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'edit') {
        this.editFranchise(result.franchise);
      }
    });
  }

  editFranchise(franchise: Franchise) {
    // Import the FranchiseDialogComponent dynamically to avoid circular imports
    import('./franchise-dialog/franchise-dialog.component').then(({ FranchiseDialogComponent }) => {
      const dialogRef = this.dialog.open(FranchiseDialogComponent, {
        width: '800px',
        maxWidth: '90vw',
        data: {
          franchise: franchise,
          mode: 'edit'
        } as FranchiseDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('✅ Franchise updated, refreshing list...', result);
          // Refresh the franchise list to show the updated franchise
          this.loadFranchises();
          this.showSnackBar(`${result.name} has been updated successfully!`);
        }
      });
    });
  }

  duplicateFranchise(franchise: Franchise) {
    // For now, open a new franchise dialog with a note about duplication
    // TODO: Implement pre-filling form data for duplication
    import('./franchise-dialog/franchise-dialog.component').then(({ FranchiseDialogComponent }) => {
      const dialogRef = this.dialog.open(FranchiseDialogComponent, {
        width: '800px',
        maxWidth: '90vw',
        data: {
          mode: 'create'
        } as FranchiseDialogData
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('✅ Franchise duplicated, refreshing list...', result);
          // Refresh the franchise list to show the duplicated franchise
          this.loadFranchises();
          this.showSnackBar(`New franchise "${result.name}" has been created! (Based on ${franchise.name})`);
        }
      });
    });
  }

  deleteFranchise(franchise: Franchise) {
    if (confirm(`Are you sure you want to delete "${franchise.name}"? This action cannot be undone.`)) {
      this.franchiseService.deleteFranchise(franchise.id).subscribe({
        next: () => {
          this.franchises = this.franchises.filter(f => f.id !== franchise.id);
          this.applyFilters();
          this.showSnackBar(`${franchise.name} has been deleted`);
        },
        error: () => {
          this.showSnackBar(`Error deleting ${franchise.name}. Please try again.`);
        }
      });
    }
  }

  toggleFranchiseStatus(franchise: Franchise, isActive: boolean) {
    this.franchiseService.updateFranchiseStatus(franchise.id, isActive).subscribe(() => {
      franchise.isActive = isActive;
      const status = isActive ? 'activated' : 'deactivated';
      this.showSnackBar(`${franchise.name} has been ${status}`);
    });
  }

  // Utility methods
  getPerformanceMetrics(franchiseId: string): FranchiseMetrics | null {
    // Return cached metrics to prevent infinite API calls
    return this.performanceCache.get(franchiseId) || null;
  }

  getCategoryLabel(category: FranchiseCategory): string {
    const categoryMap: { [key in FranchiseCategory]: string } = {
      FOOD_BEVERAGE: 'Food & Beverage',
      RETAIL: 'Retail',
      SERVICES: 'Services',
      HEALTH_FITNESS: 'Health & Fitness',
      EDUCATION: 'Education',
      AUTOMOTIVE: 'Automotive',
      REAL_ESTATE: 'Real Estate',
      TECHNOLOGY: 'Technology',
      CLEANING: 'Cleaning',
      OTHER: 'Other'
    };
    return categoryMap[category] || category;
  }

  getCategoryColor(category: FranchiseCategory): string {
    const colorMap: { [key in FranchiseCategory]: string } = {
      FOOD_BEVERAGE: '#ff9800',
      RETAIL: '#9c27b0',
      SERVICES: '#2196f3',
      HEALTH_FITNESS: '#4caf50',
      EDUCATION: '#ff5722',
      AUTOMOTIVE: '#607d8b',
      REAL_ESTATE: '#795548',
      TECHNOLOGY: '#3f51b5',
      CLEANING: '#00bcd4',
      OTHER: '#9e9e9e'
    };
    return colorMap[category] || '#9e9e9e';
  }

  formatCurrency(amount: number): string {
    return this.currencyService.formatCurrency(amount);
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}
