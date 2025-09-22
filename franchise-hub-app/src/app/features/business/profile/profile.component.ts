import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>Business Profile</h1>
      <p>Manage your business profile and information. This feature is coming soon!</p>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
    }
  `]
})
export class ProfileComponent {
}
