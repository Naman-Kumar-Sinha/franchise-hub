import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MockDataService } from './core/services/mock-data.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-debug-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
      <h1>🔍 FranchiseHub Debug Page</h1>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Current User</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="currentUser; else noUser">
              <p><strong>ID:</strong> {{ currentUser.id }}</p>
              <p><strong>Email:</strong> {{ currentUser.email }}</p>
              <p><strong>Name:</strong> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
              <p><strong>Role:</strong> {{ currentUser.role }}</p>
            </div>
            <ng-template #noUser>
              <p>No user logged in</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Data Counts</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p><strong>Franchises:</strong> {{ dataCounts.franchises }}</p>
            <p><strong>Applications:</strong> {{ dataCounts.applications }}</p>
            <p><strong>Transactions:</strong> {{ dataCounts.transactions }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Franchises in Memory</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="franchises.length > 0; else noFranchises">
              <div *ngFor="let franchise of franchises" style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>{{ franchise.name }}</strong></p>
                <p>ID: {{ franchise.id }}</p>
                <p>Owner: {{ franchise.businessOwnerId }}</p>
                <p>Created: {{ franchise.createdAt | date:'short' }}</p>
              </div>
            </div>
            <ng-template #noFranchises>
              <p>No franchises found</p>
            </ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Applications in Memory</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="applications.length > 0; else noApplications">
              <div *ngFor="let app of applications" style="border-bottom: 1px solid #eee; padding: 10px 0;">
                <p><strong>{{ app.franchiseName }}</strong></p>
                <p>ID: {{ app.id }}</p>
                <p>Partner: {{ app.partnerId }}</p>
                <p>Status: {{ app.status }}</p>
                <p>Submitted: {{ app.submittedAt | date:'short' }}</p>
              </div>
            </div>
            <ng-template #noApplications>
              <p>No applications found</p>
            </ng-template>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
        <mat-card>
          <mat-card-header>
            <mat-card-title>LocalStorage Contents</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngFor="let item of localStorageContents">
              <p><strong>{{ item.key }}:</strong> {{ item.value }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Debug Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button mat-raised-button color="primary" (click)="refreshData()">
                <mat-icon>refresh</mat-icon> Refresh Data
              </button>
              <button mat-raised-button color="accent" (click)="debugLocalStorage()">
                <mat-icon>bug_report</mat-icon> Debug LocalStorage
              </button>
              <button mat-raised-button color="accent" (click)="debugApplications()">
                <mat-icon>assignment</mat-icon> Debug Applications
              </button>
              <button mat-raised-button color="primary" (click)="reloadData()">
                <mat-icon>cloud_download</mat-icon> Reload Data
              </button>
              <button mat-raised-button color="accent" (click)="removeMockFranchises()">
                <mat-icon>cleaning_services</mat-icon> Remove Mock Franchises
              </button>
              <button mat-raised-button color="warn" (click)="clearAllData()">
                <mat-icon>delete</mat-icon> Clear All Data
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="margin-top: 20px;">
        <p><strong>Instructions:</strong></p>
        <ol>
          <li>Check if your applications appear in the "Applications in Memory" section</li>
          <li>Verify the current user ID matches the partnerId in your applications</li>
          <li>Look for any mock franchises (TechRepair Pro, FitZone Gym, QuickBite Burgers) in the franchises list</li>
          <li>Use "Debug Applications" to see detailed application debugging info</li>
          <li>Use "Reload Data" to force reload from localStorage</li>
          <li>Use "Remove Mock Franchises" to clean up mock data</li>
          <li>Use "Debug LocalStorage" to see console output</li>
          <li>Use "Clear All Data" if you need to reset everything</li>
        </ol>
      </div>
    </div>
  `
})
export class DebugPageComponent implements OnInit {
  currentUser: any = null;
  dataCounts = { franchises: 0, applications: 0, transactions: 0 };
  franchises: any[] = [];
  applications: any[] = [];
  localStorageContents: { key: string; value: string }[] = [];

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.currentUser = this.authService.getCurrentUser();
    this.dataCounts = this.mockDataService.getDataCounts();
    
    // Get current data from service
    this.franchises = (this.mockDataService as any).mockFranchises || [];
    this.applications = (this.mockDataService as any).mockApplications || [];
    
    this.loadLocalStorageContents();
  }

  loadLocalStorageContents() {
    const keys = [
      'franchise_hub_franchises',
      'franchise_hub_applications',
      'franchise_hub_transactions',
      'franchise_hub_payment_transactions',
      'franchise_hub_users'
    ];

    this.localStorageContents = keys.map(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          return {
            key,
            value: Array.isArray(parsed) ? `${parsed.length} items` : 'not array'
          };
        } else {
          return { key, value: 'not found' };
        }
      } catch (e) {
        return { key, value: `error: ${e instanceof Error ? e.message : String(e)}` };
      }
    });
  }

  debugLocalStorage() {
    this.mockDataService.debugLocalStorage();
  }

  debugApplications() {
    this.mockDataService.debugApplications();
  }

  reloadData() {
    this.mockDataService.loadFromStorage();
    this.refreshData();
  }

  removeMockFranchises() {
    if (confirm('Are you sure you want to remove mock franchises (QuickBite Burgers, FitZone Gym, TechRepair Pro)?')) {
      this.mockDataService.removeMockFranchises();
      this.refreshData();
    }
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      this.mockDataService.clearStoredData();
      this.refreshData();
    }
  }
}
