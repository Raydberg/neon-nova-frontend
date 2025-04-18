import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  active: boolean;
  role: 'admin' | 'customer' | 'staff';
  lastLogin?: Date;
  createdAt: Date;
}

@Component({
  selector: 'admin-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './user-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-in {
      animation: slideIn 0.5s ease forwards;
    }

    .form-section {
      animation: slideIn 0.5s ease forwards;
    }

    .form-section:nth-child(1) { animation-delay: 0.1s; }
    .form-section:nth-child(2) { animation-delay: 0.2s; }
    .form-section:nth-child(3) { animation-delay: 0.3s; }
    .form-section:nth-child(4) { animation-delay: 0.4s; }

    .field-error {
      max-height: 0;
      opacity: 0;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .field-error.visible {
      max-height: 60px;
      opacity: 1;
      margin-top: 0.25rem;
    }

    .btn-save {
      transition: transform 0.2s ease;
    }

    .btn-save:hover {
      transform: translateY(-2px);
    }

    .btn-save:active {
      transform: translateY(0);
    }
  `]
})
export class UserEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // UI state
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isNewUser = signal<boolean>(false);

  // Form state
  userForm!: FormGroup;

  // User data
  userId = signal<number | null>(null);
  user = signal<User | null>(null);

  // Computed properties
  pageTitle = computed(() =>
    this.isNewUser() ? 'Crear Nuevo Usuario' : 'Editar Usuario'
  );

  ngOnInit() {
    this.initForm();

    // Get the user ID from the route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id === 'new') {
        this.isNewUser.set(true);
        this.isLoading.set(false);
      } else if (id) {
        this.userId.set(Number(id));
        this.loadUser(Number(id));
      } else {
        this.router.navigate(['/admin/users']);
      }
    });
  }

  private initForm() {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      role: ['customer', Validators.required],
      active: [true]
    });
  }

  private loadUser(id: number) {
    // This would be an API call in a real app
    setTimeout(() => {
      // Simulating API response with mock data
      const mockUser: User = {
        id,
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        phoneNumber: '+34 623456789',
        active: true,
        role: 'admin',
        lastLogin: new Date(2023, 10, 18),
        createdAt: new Date(2023, 2, 5)
      };

      this.user.set(mockUser);
      this.populateForm(mockUser);
      this.isLoading.set(false);
    }, 800);
  }

  private populateForm(user: User) {
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      active: user.active
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.isSaving.set(true);

    // Simulate API call
    setTimeout(() => {
      this.isSaving.set(false);
      // Navigate back to user list with a success message
      this.router.navigate(['/admin/users']);
    }, 1000);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(controlName: string, errorName: string) {
    const control = this.userForm.get(controlName);
    return control?.touched && control?.hasError(errorName);
  }

  resetForm() {
    if (this.user()) {
      this.populateForm(this.user()!);
    } else {
      this.userForm.reset({
        role: 'customer',
        active: true
      });
    }
  }

  // Helper methods for UI
  getRoleLabel(role: string): string {
    switch(role) {
      case 'admin': return 'Administrador';
      case 'staff': return 'Personal';
      case 'customer': return 'Cliente';
      default: return role;
    }
  }
}
