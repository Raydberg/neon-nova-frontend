import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import {ProfileService} from '@core/services/profile.service';

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
            <lucide-angular name="google" class="w-3 h-3"></lucide-angular>
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
