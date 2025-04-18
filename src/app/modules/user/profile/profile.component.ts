import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '@core/services/user.service';
import { AuthService } from '@core/services/auth.service';
import { UserProfile } from '@core/models/user-profile.model';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  userService = inject(UserService);
  authService = inject(AuthService);


  isLoading = signal(true);
  isEditing = signal(false);
  updateSuccess = signal(false);
  updateError = signal<string | null>(null);
  isSaving = signal(false);


  isGoogleAccount = signal(false);
  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadUserData();

    const provider = this.authService.user()?.provider;
    const localProvider = localStorage.getItem('auth_provider');

    const isGoogle = provider === 'google' || localProvider === 'google';

    this.isGoogleAccount.set(isGoogle);

    console.log('User info:', {
      email: this.authService.user()?.email,
      provider,
      localProvider,
      isGoogleAccount: this.isGoogleAccount()
    });
  }
 //TODO:Logica para cambiar contraseña endpoint backend
  private hasLocalPassword(): boolean {

    return false;
  }
  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      phone: ['', Validators.pattern(/^\+?[0-9]{8,15}$/)],
    });
  }

  private loadUserData(): void {
    this.userService.fetchCurrentUser().subscribe({
      next: (success) => {
        if (success) {
          const profile = this.userService.getUserProfile();

          if (profile()) {
            this.profileForm.patchValue({
              firstName: profile()?.firstName,
              lastName: profile()?.lastName,
              email: profile()?.email,
              phone: profile()?.phone || ''
            });
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing.update(value => !value);
    if (!this.isEditing()) {

      this.loadUserData();
    }
    this.updateSuccess.set(false);
    this.updateError.set(null);
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const updateData = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      phone: this.profileForm.value.phone
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (success) => {
        if (success) {
          this.updateSuccess.set(true);
          this.isEditing.set(false);
        } else {
          this.updateError.set('No se pudieron guardar los cambios');
        }
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.updateError.set('Ocurrió un error al actualizar el perfil');
        this.isSaving.set(false);
      }
    });
  }
}
