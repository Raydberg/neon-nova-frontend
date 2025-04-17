import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
Chart.register(...registerables);

// Interfaces para los datos
interface StatsCard {
  title: string;
  value: string | number;
  percentChange: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  description: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  amount: number;
  date: string;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  sold: number;
  revenue: number;
}

@Component({
  selector: 'dashboard-admin',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './dashboard-admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAdminComponent implements OnInit {
  Math = Math;
  currentDate = signal(new Date());
  currentTabView = signal<'daily' | 'weekly' | 'monthly'>('daily');

  // Charts references
  salesChart: Chart | null = null;
  categoryChart: Chart | null = null;
  paymentMethodChart: Chart | null = null;

  // Stats cards data
  statsCards: StatsCard[] = [
    {
      title: 'Ingresos totales',
      value: '$12,345.67',
      percentChange: 12.5,
      icon: "dollar-sign",
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Comparado con el mes anterior'
    },
    {
      title: 'Pedidos',
      value: 156,
      percentChange: 8.2,
      icon: "shopping-cart",
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      description: '32 pedidos esta semana'
    },
    {
      title: 'Productos',
      value: 89,
      percentChange: -3.1,
      icon: "package",
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: '12 productos con poco stock'
    },
    {
      title: 'Clientes',
      value: 243,
      percentChange: 5.3,
      icon: "users",
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      description: '18 nuevos esta semana'
    }
  ];

  // Recent orders data
  recentOrders = signal<RecentOrder[]>([
    {
      id: 'ORD-001',
      customer: 'Juan Pérez',
      product: 'Laptop Pro X',
      status: 'completed',
      amount: 1299.99,
      date: '2023-09-25'
    },
    {
      id: 'ORD-002',
      customer: 'María García',
      product: 'Smartphone Galaxy Ultra',
      status: 'processing',
      amount: 899.99,
      date: '2023-09-24'
    },
    {
      id: 'ORD-003',
      customer: 'Carlos Rodríguez',
      product: 'Auriculares Pro Sound',
      status: 'pending',
      amount: 149.99,
      date: '2023-09-24'
    },
    {
      id: 'ORD-004',
      customer: 'Laura Martínez',
      product: 'Monitor 4K',
      status: 'completed',
      amount: 349.99,
      date: '2023-09-23'
    },
    {
      id: 'ORD-005',
      customer: 'Ana López',
      product: 'Teclado Mecánico',
      status: 'cancelled',
      amount: 89.99,
      date: '2023-09-22'
    }
  ]);

  // Top products data
  topProducts = signal<TopProduct[]>([
    {
      id: 1,
      name: 'Laptop Pro X',
      category: 'Laptops',
      sold: 52,
      revenue: 67599.48
    },
    {
      id: 2,
      name: 'Smartphone Galaxy Ultra',
      category: 'Smartphones',
      sold: 48,
      revenue: 43199.52
    },
    {
      id: 3,
      name: 'Auriculares Pro Sound',
      category: 'Audio',
      sold: 45,
      revenue: 6749.55
    },
    {
      id: 4,
      name: 'Smartwatch Fitness Pro',
      category: 'Wearables',
      sold: 39,
      revenue: 7799.61
    },
    {
      id: 5,
      name: 'Cámara DSLR 4K',
      category: 'Cámaras',
      sold: 28,
      revenue: 13159.72
    }
  ]);

  ngOnInit() {
    // Inicializar los gráficos cuando el componente esté cargado
    setTimeout(() => {
      this.initSalesChart();
      this.initRevenueByCategory();
      this.initRevenueByPaymentMethod();
    }, 0);

    // Actualizar fecha cada minuto
    setInterval(() => {
      this.currentDate.set(new Date());
    }, 60000);
  }

  changeChartView(view: 'daily' | 'weekly' | 'monthly'): void {
    this.currentTabView.set(view);
    this.updateSalesChart(view);
  }

  // Método para inicializar el gráfico de ventas
  private initSalesChart(): void {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Ventas',
          data: [12, 19, 15, 8, 22, 14, 25],
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }

  // Actualizar gráfico de ventas según la vista seleccionada
  private updateSalesChart(view: 'daily' | 'weekly' | 'monthly'): void {
    if (!this.salesChart) return;

    let labels: string[] = [];
    let data: number[] = [];

    switch (view) {
      case 'daily':
        labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        data = [12, 19, 15, 8, 22, 14, 25];
        break;
      case 'weekly':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        data = [55, 70, 65, 89];
        break;
      case 'monthly':
        labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        data = [540, 680, 520, 410, 790, 420, 650, 710, 580, 630, 800, 990];
        break;
    }

    this.salesChart.data.labels = labels;
    this.salesChart.data.datasets[0].data = data;
    this.salesChart.update();
  }

  // Inicializar gráfico de ingresos por categoría
  private initRevenueByCategory(): void {
    const ctx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Laptops', 'Smartphones', 'Audio', 'Wearables', 'Cámaras'],
        datasets: [{
          data: [35, 25, 15, 10, 15],
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)',
            'rgb(244, 114, 182)',
            'rgb(249, 115, 22)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
  }

  // Inicializar gráfico de ingresos por método de pago
  private initRevenueByPaymentMethod(): void {
    const ctx = document.getElementById('paymentMethodChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.paymentMethodChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tarjeta de crédito', 'PayPal', 'Transferencia', 'Efectivo'],
        datasets: [{
          label: 'Ingresos',
          data: [56000, 38000, 15000, 6000],
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(249, 115, 22, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }

  // Método auxiliar para formatear monedas
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
  }

  // Método auxiliar para obtener clase de color según el estado del pedido
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'processing':
        return 'badge-warning';
      case 'pending':
        return 'badge-info';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }

  // Método auxiliar para obtener el texto según el estado del pedido
  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
