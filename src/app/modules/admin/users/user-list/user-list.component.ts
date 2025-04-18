import { ChangeDetectionStrategy, Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime } from 'rxjs/operators';

// User interface
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
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
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
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(true);

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
    setTimeout(() => {
      this.loadUsers();
      this.isLoading.set(false);
    }, 800);

    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(term => {
      this.filterUsers(term || '');
    });

    this.applyFilters();
  }

  private loadUsers() {
    const sampleUsers: User[] = [
      {
        id: 1,
        firstName: 'Juan',
        lastName: 'García',
        email: 'juan.garcia@example.com',
        phoneNumber: '+34 612345678',
        active: true,
        role: 'customer',
        lastLogin: new Date(2023, 10, 15),
        createdAt: new Date(2023, 5, 12)
      },
      {
        id: 2,
        firstName: 'María',
        lastName: 'López',
        email: 'maria.lopez@example.com',
        phoneNumber: '+34 623456789',
        active: true,
        role: 'admin',
        lastLogin: new Date(2023, 10, 18),
        createdAt: new Date(2023, 2, 5)
      },
      {
        id: 3,
        firstName: 'Antonio',
        lastName: 'Fernández',
        email: 'antonio.fernandez@example.com',
        phoneNumber: '+34 634567890',
        active: false,
        role: 'customer',
        lastLogin: new Date(2023, 9, 25),
        createdAt: new Date(2023, 4, 20)
      },
      {
        id: 4,
        firstName: 'Laura',
        lastName: 'Martínez',
        email: 'laura.martinez@example.com',
        phoneNumber: '+34 645678901',
        active: true,
        role: 'staff',
        lastLogin: new Date(2023, 10, 20),
        createdAt: new Date(2023, 6, 18)
      },
      {
        id: 5,
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@example.com',
        active: true,
        role: 'customer',
        lastLogin: new Date(2023, 10, 12),
        createdAt: new Date(2023, 3, 15)
      },
      {
        id: 6,
        firstName: 'Ana',
        lastName: 'Sánchez',
        email: 'ana.sanchez@example.com',
        phoneNumber: '+34 656789012',
        active: false,
        role: 'customer',
        createdAt: new Date(2023, 7, 8)
      },
      {
        id: 7,
        firstName: 'Miguel',
        lastName: 'González',
        email: 'miguel.gonzalez@example.com',
        phoneNumber: '+34 667890123',
        active: true,
        role: 'staff',
        lastLogin: new Date(2023, 10, 17),
        createdAt: new Date(2023, 1, 25)
      },
      {
        id: 8,
        firstName: 'Lucía',
        lastName: 'Díaz',
        email: 'lucia.diaz@example.com',
        active: true,
        role: 'customer',
        lastLogin: new Date(2023, 10, 19),
        createdAt: new Date(2023, 8, 3)
      }
    ];

    this.users.set(sampleUsers);
    this.applyFilters();
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

  toggleUserStatus(user: User) {
    this.users.update(users =>
      users.map(u =>
        u.id === user.id ? { ...u, active: !u.active } : u
      )
    );
    this.applyFilters();
  }

  private applyFilters() {
    let result = [...this.users()];

    const searchTerm = this.searchControl.value?.toLowerCase();
    if (searchTerm) {
      result = result.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm))
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

  getUserInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getRandomColor(id: number): string {
    const colors = [
      'bg-primary text-primary-content',
      'bg-secondary text-secondary-content',
      'bg-accent text-accent-content',
      'bg-info text-info-content',
      'bg-success text-success-content',
      'bg-warning text-warning-content'
    ];

    return colors[id % colors.length];
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getRoleBadgeClass(role: string): string {
    switch(role) {
      case 'admin': return 'badge-primary';
      case 'staff': return 'badge-secondary';
      default: return 'badge-ghost';
    }
  }
}
