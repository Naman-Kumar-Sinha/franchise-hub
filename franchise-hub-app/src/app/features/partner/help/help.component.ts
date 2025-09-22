import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="help-container">
      <h1>Help & Support</h1>
      <p>Get help and support for your franchise journey. This feature is coming soon!</p>
    </div>
  `,
  styles: [`
    .help-container {
      padding: 24px;
    }
  `]
})
export class HelpComponent {
}
