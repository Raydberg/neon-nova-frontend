import {ChangeDetectionStrategy, Component, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {UserService} from '@core/services/user.service';
import {AuthService} from '@core/services/auth.service';
import {EditProfileComponent} from '../edit-profile/edit-profile.component';
import {ProfileService} from '@core/services/profile.service';
import {ProfileSecurityComponent} from '@modules/user/profile-security/profile-security.component';
import {ProfileHeaderComponent} from '@modules/user/profile-header/profile-header.component';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    ProfileHeaderComponent,
    ProfileSecurityComponent,
    EditProfileComponent
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.profileService.isLoading.set(true);

    this.userService.fetchCurrentUser().subscribe({
      next: (success) => {
        if (success) {
          this.profileService.updateProfileData();
        }
        this.profileService.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.profileService.isLoading.set(false);
        this.profileService.setUpdateError('No se pudieron cargar tus datos. Por favor, intenta nuevamente.');
      }
    });
  }
}
