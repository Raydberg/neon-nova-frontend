import { ChangeDetectionStrategy, Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';

// Interfaz para las órdenes
export interface Order {
  id: string;
  date: Date;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  trackingNumber?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './order-list.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .order-card {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .order-card:nth-child(1) { animation-delay: 0.1s; }
    .order-card:nth-child(2) { animation-delay: 0.2s; }
    .order-card:nth-child(3) { animation-delay: 0.3s; }
    .order-card:nth-child(4) { animation-delay: 0.4s; }
    .order-card:nth-child(5) { animation-delay: 0.5s; }

    .status-badge {
      transition: all 0.2s ease;
    }

    .empty-state {
      animation: fadeIn 0.5s ease-out forwards;
    }

    .order-card:hover {
      transform: translateY(-3px);
      transition: transform 0.2s ease;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent implements OnInit {
  // Iconos
  // readonly PackageIcon = Package;
  // readonly SearchIcon = Search;
  // readonly CalendarIcon = Calendar;
  // readonly ArrowUpDownIcon = ArrowUpDown;
  // readonly CheckCircleIcon = CheckCircle2;
  // readonly TruckIcon = Truck;
  // readonly ClockIcon = Clock;
  // readonly AlertTriangleIcon = AlertTriangle;
  // readonly XCircleIcon = XCircle;

  // Estado
  orders = signal<Order[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  currentFilter = signal<string | null>(null);
  currentSort = signal<'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'>('date-desc');

  // Calcular órdenes filtradas
  filteredOrders = computed(() => {
    let result = this.orders();
    const query = this.searchQuery().toLowerCase().trim();

    // Aplicar búsqueda
    if (query) {
      result = result.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }

    // Aplicar filtro de estado
    if (this.currentFilter()) {
      result = result.filter(order => order.status === this.currentFilter());
    }

    // Aplicar ordenamiento
    switch (this.currentSort()) {
      case 'date-desc':
        return result.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'date-asc':
        return result.slice().sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'total-desc':
        return result.slice().sort((a, b) => b.total - a.total);
      case 'total-asc':
        return result.slice().sort((a, b) => a.total - b.total);
      default:
        return result;
    }
  });

  ngOnInit(): void {
    // Simulación de carga de datos
    setTimeout(() => {
      this.loadOrders();
      this.isLoading.set(false);
    }, 800);
  }

  // Métodos para UI
  search(query: string): void {
    this.searchQuery.set(query);
  }

  setFilter(filter: string | null): void {
    this.currentFilter.set(filter);
  }

  setSort(sort: 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc'): void {
    this.currentSort.set(sort);
  }

  // Método para formatear precio
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  // Método para formatear fecha
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Método para obtener clase CSS según el estado
  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-info';
      case 'processing':
        return 'badge-warning';
      case 'pending':
        return 'badge-primary';
      case 'cancelled':
        return 'badge-error';
      default:
        return '';
    }
  }

  // Método para obtener icono según el estado
  getStatusIcon(status: string): string {
    switch (status) {
      case 'delivered':
        return 'check-circle-2';
      case 'shipped':
        return 'truck';
      case 'processing':
        return 'clock';
      case 'pending':
        return 'alert-triangle';
      case 'cancelled':
        return 'x-circle';
      default:
        return 'package';
    }
  }

  // Método para obtener texto según el estado
  getStatusText(status: string): string {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'shipped':
        return 'Enviado';
      case 'processing':
        return 'En proceso';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }

  private loadOrders(): void {
    // Datos simulados - estos vendrían de una API real
    this.orders.set([
      {
        id: 'ORD-12345',
        date: new Date(2023, 9, 25),
        total: 1299.99,
        status: 'delivered',
        items: [
          {
            id: 1,
            product_id: 1,
            name: "Laptop Pro X",
            price: 1299.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
          }
        ],
        trackingNumber: 'TRK4589612378'
      },
      {
        id: 'ORD-12346',
        date: new Date(2023, 9, 28),
        total: 499.98,
        status: 'shipped',
        items: [
          {
            id: 2,
            product_id: 3,
            name: "Auriculares Noise Cancel",
            price: 249.99,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
          }
        ],
        trackingNumber: 'TRK7896543210'
      },
      {
        id: 'ORD-12347',
        date: new Date(2023, 10, 2),
        total: 1049.98,
        status: 'processing',
        items: [
          {
            id: 3,
            product_id: 5,
            name: "Cámara DSLR 4K",
            price: 1049.98,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
          }
        ]
      },
      {
        id: 'ORD-12348',
        date: new Date(2023, 10, 5),
        total: 199.99,
        status: 'pending',
        items: [
          {
            id: 4,
            product_id: 4,
            name: "Smartwatch Fitness Pro",
            price: 199.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
          }
        ]
      },
      {
        id: 'ORD-12349',
        date: new Date(2023, 9, 22),
        total: 349.99,
        status: 'cancelled',
        items: [
          {
            id: 5,
            product_id: 8,
            name: "Monitor Curvo 32\"",
            price: 349.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
          }
        ]
      }
    ]);
  }
}
