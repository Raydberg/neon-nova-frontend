import {ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {UserService} from '@core/services/user.service';
import {AuthService} from '@core/services/auth.service';
import {UpdateProfileRequest} from '@core/services/user.service';
import {Subscription} from 'rxjs';
import {ProfileService} from '@core/services/profile.service';

@Component({
  selector: 'user-edit-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);

  isEditing = signal(false);
  profileForm!: FormGroup;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.initForm();
    this.updateFormWithProfileData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)]
    });

    this.profileForm.disable();
  }

  private updateFormWithProfileData(): void {
    const profile = this.userService.getUserProfile()();
    if (profile) {
      this.profileForm.patchValue({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || ''
      });

      if (this.authService.isGoogleUser()) {
        this.profileForm.get('email')?.disable();
      }
    }
  }

  toggleEdit(): void {
    this.isEditing.update(value => !value);

    if (this.isEditing()) {
      this.profileForm.enable();
      if (this.authService.isGoogleUser()) {
        this.profileForm.get('email')?.disable();
      }
      this.profileService.clearUpdateStatus();
    } else {
      this.updateFormWithProfileData();
      this.profileForm.disable();
    }
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const updateData: UpdateProfileRequest = {};
    const profile = this.userService.getUserProfile()();
    const formValue = this.profileForm.value;

    if (!profile) return;

    if (formValue.firstName !== profile.firstName) {
      updateData.firstName = formValue.firstName;
    }

    if (formValue.lastName !== profile.lastName) {
      updateData.lastName = formValue.lastName;
    }

    if (!this.authService.isGoogleUser() &&
      !this.profileForm.get('email')?.disabled &&
      formValue.email !== profile.email) {
      updateData.email = formValue.email;
    }

    // Phone - only if changed
    const currentPhone = profile.phone || '';
    if (formValue.phone !== currentPhone) {
      updateData.phone = formValue.phone || null;
    }

    // Skip request if no changes
    if (Object.keys(updateData).length === 0) {
      this.profileService.isSaving.set(false);
      this.isEditing.set(false);
      this.profileService.setUpdateSuccess();
      this.profileForm.disable();
      return;
    }

    const saveSubscription = this.profileService.saveProfile(updateData).subscribe({
      next: (success) => {
        if (success) {
          this.profileService.updateProfileData();
          this.profileService.setUpdateSuccess();
          this.isEditing.set(false);
          this.profileForm.disable();
        } else {
          this.handleUpdateError('No se pudieron guardar los cambios');
        }
        this.profileService.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);

        if (error?.error?.message) {
          this.handleUpdateError(error.error.message);
        } else if (error?.status === 409) {
          this.handleUpdateError('Este correo electrónico ya está en uso');
        } else if (error?.status === 401) {
          this.handleSessionExpired();
        } else {
          this.handleUpdateError('Ocurrió un error al actualizar el perfil');
        }
      }
    });

    this.subscriptions.add(saveSubscription);
  }

  private handleUpdateError(message: string): void {
    this.profileService.setUpdateError(message);
    this.updateFormWithProfileData();
    this.profileService.isSaving.set(false);
  }

  private handleSessionExpired(): void {
    this.profileService.setUpdateError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    setTimeout(() => {
      this.authService.logout();
    }, 2000);
  }

  onAvatarError(): void {
    this.profileService.handleAvatarError();
  }
}
