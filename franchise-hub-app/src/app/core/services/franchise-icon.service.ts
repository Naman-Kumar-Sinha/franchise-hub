import { Injectable } from '@angular/core';
import { FranchiseCategory } from '../models/franchise.model';

@Injectable({
  providedIn: 'root'
})
export class FranchiseIconService {

  private categoryIconMap: { [key in FranchiseCategory]: string } = {
    [FranchiseCategory.FOOD_BEVERAGE]: 'restaurant',
    [FranchiseCategory.RETAIL]: 'store',
    [FranchiseCategory.SERVICES]: 'business',
    [FranchiseCategory.HEALTH_FITNESS]: 'fitness_center',
    [FranchiseCategory.EDUCATION]: 'school',
    [FranchiseCategory.AUTOMOTIVE]: 'directions_car',
    [FranchiseCategory.REAL_ESTATE]: 'home',
    [FranchiseCategory.TECHNOLOGY]: 'computer',
    [FranchiseCategory.CLEANING]: 'cleaning_services',
    [FranchiseCategory.OTHER]: 'business_center'
  };

  private categoryColorMap: { [key in FranchiseCategory]: string } = {
    [FranchiseCategory.FOOD_BEVERAGE]: '#FF6B35',
    [FranchiseCategory.RETAIL]: '#4CAF50',
    [FranchiseCategory.SERVICES]: '#2196F3',
    [FranchiseCategory.HEALTH_FITNESS]: '#E91E63',
    [FranchiseCategory.EDUCATION]: '#9C27B0',
    [FranchiseCategory.AUTOMOTIVE]: '#607D8B',
    [FranchiseCategory.REAL_ESTATE]: '#795548',
    [FranchiseCategory.TECHNOLOGY]: '#3F51B5',
    [FranchiseCategory.CLEANING]: '#00BCD4',
    [FranchiseCategory.OTHER]: '#757575'
  };

  /**
   * Get the Material Design icon name for a franchise category
   */
  getIconForCategory(category: FranchiseCategory): string {
    return this.categoryIconMap[category] || 'business_center';
  }

  /**
   * Get the color for a franchise category
   */
  getColorForCategory(category: FranchiseCategory): string {
    return this.categoryColorMap[category] || '#757575';
  }

  /**
   * Get both icon and color for a franchise category
   */
  getIconAndColorForCategory(category: FranchiseCategory): { icon: string; color: string } {
    return {
      icon: this.getIconForCategory(category),
      color: this.getColorForCategory(category)
    };
  }

  /**
   * Check if an image URL is valid/exists
   */
  hasValidImage(imageUrl: string): boolean {
    return !!(imageUrl && imageUrl.trim() !== '' && !imageUrl.includes('placeholder'));
  }
}
