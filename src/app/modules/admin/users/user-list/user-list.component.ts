import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, finalize } from 'rxjs/operators';
import { UserModel } from '@core/models/user-model';
import { AdminUserService } from '@core/services/admin/admin-user.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  active: boolean;
  role: 'admin' | 'user';
  lastLogin?: Date;
  createdAt: Date;
  avatarUrl?: string;
  initialAvatar?: string;
}

@Component({
  selector: 'admin-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .user-row {
      animation: fadeIn 0.4s ease-out forwards;
    }

    .user-row:nth-child(1) {
      animation-delay: 0.05s;
    }

    .user-row:nth-child(2) {
      animation-delay: 0.1s;
    }

    .user-row:nth-child(3) {
      animation-delay: 0.15s;
    }

    .user-row:nth-child(4) {
      animation-delay: 0.2s;
    }

    .user-row:nth-child(5) {
      animation-delay: 0.25s;
    }

    .user-row:nth-child(6) {
      animation-delay: 0.3s;
    }

    .user-row:nth-child(7) {
      animation-delay: 0.35s;
    }

    .user-row:nth-child(8) {
      animation-delay: 0.4s;
    }

    .user-row:nth-child(9) {
      animation-delay: 0.45s;
    }

    .user-row:nth-child(10) {
      animation-delay: 0.5s;
    }

    .status-badge {
      transition: all 0.3s ease;
    }

    .status-toggle {
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    .status-toggle:active {
      transform: scale(0.95);
    }
  `]
})
export class UserListComponent implements OnInit {
  private userService = inject(AdminUserService);
  userToDelete = signal<User | null>(null);
  avatarLoadErrors = signal<Record<string, boolean>>({});
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  searchControl = new FormControl('');
  sortColumn = signal<string>('lastName');
  sortDirection = signal<'asc' | 'desc'>('asc');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');

  userCount = computed(() => ({
    total: this.users().length,
    active: this.users().filter(user => user.active).length,
    inactive: this.users().filter(user => !user.active).length,
  }));

  ngOnInit() {
    this.loadUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.filterUsers(term || '');
    });
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getUsers()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (apiUsers) => {
          const users = this.mapApiUsersToComponentUsers(apiUsers);
          this.users.set(users);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error cargando usuarios:', err);
          this.error.set('Ocurrió un error al cargar los usuarios. Por favor, intenta nuevamente.');
        }
      });
  }
  hasAvatar(user: User): boolean {
    return !!user.avatarUrl && !this.avatarLoadErrors()[user.id];
  }

  getUserAvatar(user: User): string | null {
    if (this.avatarLoadErrors()[user.id]) return null;
    return this.userService.processAvatarUrl(user.avatarUrl);
  }

  onAvatarError(userId: string): void {
    this.avatarLoadErrors.update(errors => ({
      ...errors,
      [userId]: true
    }));
  }

  getUserInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
  private mapApiUsersToComponentUsers(apiUsers: UserModel[]): User[] {
    return apiUsers.map(apiUser => ({
      id: apiUser.id,
      firstName: apiUser.firstName,
      lastName: apiUser.lastName,
      email: apiUser.email,
      active: apiUser.isActive,
      role: apiUser.isAdmin ? 'admin' : 'user',
      lastLogin: apiUser.lastLogin,
      createdAt: apiUser.createdAt,
      avatarUrl: apiUser.avatarUrl,
      initialAvatar: apiUser.initialAvatar || `${apiUser.firstName[0]}${apiUser.lastName[0]}`
    }));
  }

  filterUsers(term: string) {
    this.searchControl.setValue(term, { emitEvent: false });
    this.applyFilters();
  }

  sortBy(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }

    this.applyFilters();
  }

  setStatusFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  // In user-list.component.ts
  // ...existing code...

  toggleUserStatus(user: User) {
    const previousUsers = [...this.users()];
    const newStatus = !user.active;

    // Actualizar optimistamente la interfaz para mejor experiencia de usuario
    this.users.update(users =>
      users.map(u =>
        u.id === user.id ? { ...u, active: newStatus } : u
      )
    );
    this.applyFilters();

    // Llamar a la API
    this.userService.setUserStatus(user.id, newStatus).subscribe({
      next: () => {
        // Estado cambiado exitosamente - ya actualizamos la UI
      },
      error: (err) => {
        console.error('Error al cambiar estado del usuario:', err);

        // Revertir cambios en la UI en caso de error
        this.users.set(previousUsers);
        this.applyFilters();

        // Mensaje de error más específico
        let errorMsg = 'No se pudo cambiar el estado del usuario.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        }

        this.error.set(errorMsg + ' Intente nuevamente.');
        setTimeout(() => this.error.set(null), 5000);
      }
    });
  }

  private applyFilters() {
    let result = [...this.users()];

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      result = result.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filterStatus() !== 'all') {
      const isActive = this.filterStatus() === 'active';
      result = result.filter(user => user.active === isActive);
    }

    const column = this.sortColumn();
    const direction = this.sortDirection();

    result.sort((a, b) => {
      let aValue: any = a[column as keyof User];
      let bValue: any = b[column as keyof User];

      if (column === 'name') {
        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredUsers.set(result);
  }

  // getUserInitials(firstName: string, lastName: string): string {
  //   return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  // }

  getRandomColor(id: string): string {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content',
      'bg-accent text-accent-content',
      'bg-info text-info-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content'
    ];

    // Convertir el ID a un número para usar con el arreglo de colores
    const numericValue = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[numericValue % colors.length];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'badge-primary';
      case 'user':
        return 'badge-secondary';
      default:
        return 'badge-ghost';
    }
  }

  reloadUsers() {
    this.loadUsers();
  }

  showDeleteModal(user: User) {
    this.userToDelete.set(user);
    const modal = document.getElementById('deleteUserModal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  // deleteUser() {
  //   const user = this.userToDelete();
  //   if (!user) return;
  //
  //   this.isLoading.set(true);
  //   this.userService.deleteUser(user.id)
  //     .pipe(finalize(() => this.isLoading.set(false)))
  //     .subscribe({
  //       next: () => {
  //         this.reloadUsers();
  //       },
  //       error: (err) => {
  //         console.error('Error eliminando usuario:', err);
  //         this.error.set('No se pudo eliminar el usuario. Intente nuevamente.');
  //         setTimeout(() => this.error.set(null), 5000);
  //       }
  //     });
  // }
}
