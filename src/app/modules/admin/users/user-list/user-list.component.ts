import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, finalize } from 'rxjs/operators';
import { UserModel } from '@core/models/user-model';
import { AdminUserService } from '@core/services/admin/admin-user.service';
import { AvatarService } from '@core/services/avatar.service';
import { NotificationService } from '@core/services/notification.service';
import {ReportService} from '@core/services/report.service';

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

    .user-row:nth-child(1) { animation-delay: 0.05s; }
    .user-row:nth-child(2) { animation-delay: 0.1s; }
    .user-row:nth-child(3) { animation-delay: 0.15s; }
    .user-row:nth-child(4) { animation-delay: 0.2s; }
    .user-row:nth-child(5) { animation-delay: 0.25s; }
    .user-row:nth-child(6) { animation-delay: 0.3s; }
    .user-row:nth-child(7) { animation-delay: 0.35s; }
    .user-row:nth-child(8) { animation-delay: 0.4s; }
    .user-row:nth-child(9) { animation-delay: 0.45s; }
    .user-row:nth-child(10) { animation-delay: 0.5s; }

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
  private avatarService = inject(AvatarService);
  private notificationService = inject(NotificationService);

  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);
  private reportService = inject(ReportService);

  // Añadir un signal para controlar el estado de generación del reporte
  isGeneratingReport = signal(false);
  // Signals existentes
  avatarLoadErrors = signal<Record<string, boolean>>({});
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(true);
  isTogglingStatus = signal<string | null>(null);

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
          this.notificationService.error('Ocurrió un error al cargar los usuarios. Por favor, intenta nuevamente.');
        }
      });
  }
  openDeleteModal(user: User) {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
    this.deleteError.set(null);
  }
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    // Pequeño retraso para asegurarnos que la animación de cierre se complete
    setTimeout(() => {
      this.userToDelete.set(null);
      this.deleteError.set(null);
    }, 300);
  }
  hasAvatar(user: User): boolean {
    return !!user.avatarUrl && !this.avatarLoadErrors()[user.id];
  }

  getUserAvatar(user: User): string | null {
    if (this.avatarLoadErrors()[user.id]) return null;

    if (user.avatarUrl) {
      return this.avatarService.processAvatarUrl(user.avatarUrl);
    } else if (user.initialAvatar) {
      // Si no hay avatarUrl pero sí hay initialAvatar, generar avatar con iniciales
      return this.avatarService.getAvatarURL(user.initialAvatar, user.id);
    }

    return null;
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
  downloadUserReport(): void {
    this.isGeneratingReport.set(true);

    this.reportService.generateUserReport()
      .pipe(finalize(() => this.isGeneratingReport.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          // Crear URL del objeto blob
          const url = window.URL.createObjectURL(blob);

          // Crear enlace para descarga
          const link = document.createElement('a');
          link.href = url;

          // Nombre del archivo con la fecha actual
          const date = new Date().toISOString().split('T')[0];
          link.download = `reporte-usuarios-${date}.pdf`;

          // Simular clic para descargar
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Liberar URL
          window.URL.revokeObjectURL(url);

          // Mostrar notificación de éxito
          this.notificationService.success('Reporte de usuarios descargado correctamente');
        },
        error: (err) => {
          console.error('Error al generar el reporte de usuarios:', err);
          this.notificationService.error('No se pudo descargar el reporte. Intente nuevamente.');
        }
      });
  }
  setStatusFilter(status: 'all' | 'active' | 'inactive') {
    this.filterStatus.set(status);
    this.applyFilters();
  }

  toggleUserStatus(user: User) {
    // Si ya está en proceso de cambio, no hacer nada
    if (this.isTogglingStatus() === user.id) return;

    const previousUsers = [...this.users()];
    const newStatus = !user.active;
    const statusText = newStatus ? 'activar' : 'desactivar';

    // Marcar el usuario como en proceso de cambio
    this.isTogglingStatus.set(user.id);

    // Actualizar optimistamente la interfaz para mejor experiencia de usuario
    this.users.update(users =>
      users.map(u =>
        u.id === user.id ? { ...u, active: newStatus } : u
      )
    );
    this.applyFilters();

    // Llamar a la API
    this.userService.setUserStatus(user.id, newStatus)
      .pipe(finalize(() => this.isTogglingStatus.set(null)))
      .subscribe({
        next: () => {
          // Estado cambiado exitosamente
          this.notificationService.success(
            `Usuario ${user.firstName} ${user.lastName} ${newStatus ? 'activado' : 'desactivado'} correctamente`
          );
        },
        error: (err) => {
          console.error('Error al cambiar estado del usuario:', err);

          // Revertir cambios en la UI en caso de error
          this.users.set(previousUsers);
          this.applyFilters();

          // Mensaje de error más específico
          let errorMsg = `No se pudo ${statusText} al usuario.`;
          if (err.error?.message) {
            errorMsg = err.error.message;
          }

          this.notificationService.error(errorMsg);
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

  getAvatarBackgroundColor(userId: string): string {
    return this.avatarService.getAvatarBackgroundColor(userId);
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
    this.notificationService.info('Recargando lista de usuarios...');
  }

  confirmDelete() {
    const user = this.userToDelete();
    if (!user) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.userService.deleteUser(user.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          // Cerramos el modal
          this.showDeleteModal.set(false);

          // Notificamos al usuario del éxito
          this.notificationService.success(`Usuario ${user.firstName} ${user.lastName} eliminado correctamente`);

          // Recargamos la lista completa de usuarios para sincronizar con el servidor
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error eliminando usuario:', err);

          // Mostrar error en el modal
          let errorMsg = 'No se pudo eliminar al usuario.';
          if (err.message) {
            errorMsg = err.message;
          } else if (err.error?.message) {
            errorMsg = err.error.message;
          }

          this.deleteError.set(errorMsg);
        }
      });
  }

}
