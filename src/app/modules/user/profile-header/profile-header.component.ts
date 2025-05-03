import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { ProfileService } from '@core/services/profile.service';

@Component({
  selector: 'profile-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      <!-- Avatar del usuario -->
      <div class="avatar placeholder">
        @if (profileService.displayHasAvatar()) {
          <div class="w-24 h-24 rounded-full ring ring-primary ring-offset-2">
            <img
              [src]="profileService.getDisplayAvatar()"
              alt="Avatar de usuario"
              (error)="profileService.handleAvatarError()"
              class="w-full h-full object-cover"
            />
          </div>
        } @else {
          <div
            class="rounded-full w-24 h-24 flex items-center justify-center ring ring-primary ring-offset-2"
            [ngClass]="userService.getAvatarBackground()"
            style="position: relative;"
          >
            <span
              class="text-3xl font-bold"
              style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); line-height: 1;"
            >{{ userService.userInitials() }}</span>
          </div>
        }
      </div>

      <div class="text-center md:text-left">
        <h2 class="text-2xl font-bold">{{ userService.userName() }}</h2>
        <p class="text-base-content/70">{{ authService.user()?.email }}</p>

        @if (authService.isGoogleUser()) {
          <div class="badge badge-info gap-1 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 128 128" class="mr-1">
  <path fill="#fff" d="M44.59 4.21a63.28 63.28 0 0 0 4.33 120.9a67.6 67.6 0 0 0 32.36.35a57.13 57.13 0 0 0 25.9-13.46a57.44 57.44 0 0 0 16-26.26a74.3 74.3 0 0 0 1.61-33.58H65.27v24.69h34.47a29.72 29.72 0 0 1-12.66 19.52a36.2 36.2 0 0 1-13.93 5.5a41.3 41.3 0 0 1-15.1 0A37.2 37.2 0 0 1 44 95.74a39.3 39.3 0 0 1-14.5-19.42a38.3 38.3 0 0 1 0-24.63a39.25 39.25 0 0 1 9.18-14.91A37.17 37.17 0 0 1 76.13 27a34.3 34.3 0 0 1 13.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.2 61.2 0 0 0 87.2 4.59a64 64 0 0 0-42.61-.38"/>
  <path fill="#e33629" d="M44.59 4.21a64 64 0 0 1 42.61.37a61.2 61.2 0 0 1 20.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.3 34.3 0 0 0-13.64-8a37.17 37.17 0 0 0-37.46 9.74a39.25 39.25 0 0 0-9.18 14.91L8.76 35.6A63.53 63.53 0 0 1 44.59 4.21"/>
  <path fill="#f8bd00" d="M3.26 51.5a63 63 0 0 1 5.5-15.9l20.73 16.09a38.3 38.3 0 0 0 0 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 0 1-5.5-40.9"/>
  <path fill="#587dbd" d="M65.27 52.15h59.52a74.3 74.3 0 0 1-1.61 33.58a57.44 57.44 0 0 1-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0 0 12.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68"/>
  <path fill="#319f43" d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0 0 44 95.74a37.2 37.2 0 0 0 14.08 6.08a41.3 41.3 0 0 0 15.1 0a36.2 36.2 0 0 0 13.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 0 1-25.9 13.47a67.6 67.6 0 0 1-32.36-.35a63 63 0 0 1-23-11.59A63.7 63.7 0 0 1 8.75 92.4"/>
</svg>

            Cuenta de Google
          </div>
        } @else {
          <div class="badge badge-neutral gap-1 mt-2">
            <lucide-angular name="user" class="w-3 h-3"></lucide-angular>
            Cuenta estándar
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }
  `]
})
export class ProfileHeaderComponent {
  userService = inject(UserService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
}
