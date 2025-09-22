import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  /**
   * Format currency amount in Indian Rupees (₹)
   * @param amount - The amount to format
   * @param showDecimals - Whether to show decimal places (default: false)
   * @returns Formatted currency string
   */
  formatCurrency(amount: number, showDecimals: boolean = false): string {
    const fractionDigits = showDecimals ? 2 : 0;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    }).format(amount);
  }

  /**
   * Format currency amount with custom formatting for large numbers
   * @param amount - The amount to format
   * @param compact - Whether to use compact notation (e.g., ₹1.2L for ₹1,20,000)
   * @returns Formatted currency string
   */
  formatCurrencyCompact(amount: number, compact: boolean = false): string {
    if (compact && amount >= 100000) {
      // Convert to lakhs for amounts >= 1 lakh
      if (amount >= 10000000) {
        // Convert to crores for amounts >= 1 crore
        const crores = amount / 10000000;
        return `₹${crores.toFixed(1)}Cr`;
      } else {
        const lakhs = amount / 100000;
        return `₹${lakhs.toFixed(1)}L`;
      }
    }
    
    return this.formatCurrency(amount);
  }

  /**
   * Get the currency symbol
   * @returns Indian Rupee symbol
   */
  getCurrencySymbol(): string {
    return '₹';
  }

  /**
   * Get the currency code
   * @returns Indian Rupee currency code
   */
  getCurrencyCode(): string {
    return 'INR';
  }
}
