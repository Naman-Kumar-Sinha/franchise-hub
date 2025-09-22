import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h1>Business Settings</h1>
      <p>Manage your business account settings and preferences. This feature is coming soon!</p>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
    }
  `]
})
export class SettingsComponent {
}
