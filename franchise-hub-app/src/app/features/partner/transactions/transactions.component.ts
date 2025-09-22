import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="transactions-container">
      <h1>Transaction History</h1>
      <p>View your transaction history and financial details. This feature is coming soon!</p>
    </div>
  `,
  styles: [`
    .transactions-container {
      padding: 24px;
    }
  `]
})
export class TransactionsComponent {
}
