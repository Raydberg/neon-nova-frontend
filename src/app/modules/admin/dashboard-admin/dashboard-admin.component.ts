import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService } from '@app/core/services/admin/dashboard.service';
import { DashboardStacks, LowStockProduct, TopCategory } from '@core/interfaces/http-dashboard';
import { Subscription } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

Chart.register(...registerables);

interface StatCard {
  title: string;
  value: string | number;
  percentChange: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  description: string;
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
export class DashboardAdminComponent implements OnInit, AfterViewInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private subscription = new Subscription();

  // Utility objects
  protected Math = Math;

  // Dashboard data
  dashboardData = signal<DashboardStacks | null>(null);
  lowStockProducts = signal<LowStockProduct[]>([]);
  topCategories = signal<TopCategory[]>([]);

  // UI state
  currentDate = signal(new Date());
  currentTabView = signal<'daily' | 'weekly' | 'monthly'>('weekly');
  isLoading = signal(true);
  error = signal<string | null>(null);
  reloadingCharts = signal(false); // Nuevo estado para mostrar cuando se están recargando las gráficas

  // Chart instances
  private salesChart: Chart | null = null;
  private categoryChart: Chart | null = null;
  private stockChart: Chart | null = null;

  // Dashboard stats cards derived from API data
  statsCards = signal<StatCard[]>([]);

  // Dashboard resource
  dashboardResource = rxResource({
    loader: () => this.dashboardService.getAllStacksDashboard()
  });

  ngOnInit() {
    this.loadDashboardData();

    // Set interval to update currentDate every minute
    const dateInterval = setInterval(() => {
      this.currentDate.set(new Date());
    }, 60000);

    // Clean up interval on destroy
    this.subscription.add(() => clearInterval(dateInterval));
  }

  ngAfterViewInit() {
    // Initialize charts after a short delay to ensure DOM elements are ready
    setTimeout(() => {
      this.initCharts();
    }, 300);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

    // Clean up chart instances
    if (this.salesChart) this.salesChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.stockChart) this.stockChart.destroy();
  }

  // Nueva función para recargar específicamente las gráficas
  reloadCharts() {
    this.reloadingCharts.set(true);

    // Destruir las gráficas existentes si hay
    if (this.salesChart) {
      this.salesChart.destroy();
      this.salesChart = null;
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }
    if (this.stockChart) {
      this.stockChart.destroy();
      this.stockChart = null;
    }

    // Reinicializar las gráficas con un pequeño retraso
    setTimeout(() => {
      this.initCharts();

      // Si tenemos datos, actualizamos las gráficas con ellos
      const data = this.dashboardData();
      if (data) {
        setTimeout(() => {
          this.updateCharts(data);
          this.reloadingCharts.set(false);
        }, 100);
      } else {
        this.reloadingCharts.set(false);
      }
    }, 200);
  }

  loadDashboardData() {
    this.isLoading.set(true);
    this.error.set(null);

    this.subscription.add(
      this.dashboardService.getAllStacksDashboard().subscribe({
        next: (data: DashboardStacks) => {
          console.log('Dashboard data loaded:', data);
          this.dashboardData.set(data);
          this.lowStockProducts.set(data.productStats.lowStockProducts);
          this.topCategories.set(data.categoryStats.topCategories);
          this.updateStatsCards(data);
          this.isLoading.set(false);

          // Update charts with real data
          setTimeout(() => {
            this.updateCharts(data);
          }, 100);
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
          this.error.set('Error al cargar los datos del dashboard');
          this.isLoading.set(false);
        }
      })
    );
  }

  updateStatsCards(data: DashboardStacks) {
    const cards: StatCard[] = [
      {
        title: 'Usuarios activos',
        value: data.userStats.activeUsersCount,
        percentChange: data.userStats.activeUsersPercentage,
        icon: "users",
        iconBgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        description: `${data.userStats.newUsersThisWeek} nuevos esta semana`
      },
      {
        title: 'Productos totales',
        value: data.productStats.totalProductsCount,
        percentChange: data.productStats.productsGrowthPercentage,
        icon: "package",
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        description: `${data.productStats.lowStockProductsCount} productos con poco stock`
      },
      {
        title: 'Categorías',
        value: data.categoryStats.totalCategoriesCount,
        percentChange: data.categoryStats.categoriesGrowthPercentage,
        icon: "tag",
        iconBgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        description: `${data.categoryStats.activeCategoriesCount} categorías activas`
      },
      {
        title: 'Usuarios totales',
        value: data.userStats.totalUsersCount,
        percentChange: data.userStats.newUsersPercentage,
        icon: "user-plus",
        iconBgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
        description: `${Math.round((data.userStats.activeUsersCount / data.userStats.totalUsersCount) * 100)}% activos actualmente`
      }
    ];

    this.statsCards.set(cards);
  }

  initCharts() {
    // Sales chart (mock data initially - will be updated with real data)
    const salesCtx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (salesCtx) {
      this.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
          datasets: [{
            label: 'Ventas',
            data: [0, 0, 0, 0, 0, 0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index' as const,
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          animation: {
            duration: 500 // Reducir tiempo de animación
          }
        }
      });
    }

    // Category chart (will be populated with data from API)
    const categoryCtx = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCtx) {
      this.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            label: 'Productos por categoría',
            data: [],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(16, 185, 129, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(236, 72, 153, 0.7)',
              'rgba(14, 165, 233, 0.7)',
              'rgba(217, 119, 6, 0.7)',
              'rgba(220, 38, 38, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right' as const,
              labels: {
                boxWidth: 12,
                font: {
                  size: 11
                }
              }
            }
          },
          animation: {
            duration: 500 // Reducir tiempo de animación
          }
        }
      });
    }

    // Stock chart for low stock products
    const stockCtx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (stockCtx) {
      this.stockChart = new Chart(stockCtx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Stock',
            data: [],
            backgroundColor: [],
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y' as const,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  return tooltipItems[0].label;
                }
              }
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: false
              },
              ticks: {
                precision: 0
              }
            },
            y: {
              grid: {
                display: false
              }
            }
          },
          animation: {
            duration: 500 // Reducir tiempo de animación
          }
        }
      });
    }
  }

  updateCharts(data: DashboardStacks) {
    // Update category chart with real data from API
    if (this.categoryChart && data.categoryStats.topCategories) {
      const categories = data.categoryStats.topCategories;
      this.categoryChart.data.labels = categories.map(cat => cat.name);
      this.categoryChart.data.datasets[0].data = categories.map(cat => cat.productCount);
      this.categoryChart.update();
    }


    // Update stock chart with low stock products
    if (this.stockChart && data.productStats.lowStockProducts) {
      const lowStock = data.productStats.lowStockProducts.slice(0, 5); // Get top 5 low stock products

      // Truncate long names for better display
      const truncateString = (str: string, maxLength: number = 25) => {
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
      };

      // Color based on stock level
      const getStockColor = (stock: number) => {
        if (stock === 0) return 'rgba(239, 68, 68, 0.8)'; // Red for out of stock
        if (stock <= 2) return 'rgba(245, 158, 11, 0.8)'; // Orange for very low
        return 'rgba(16, 185, 129, 0.8)'; // Green for others
      };

      this.stockChart.data.labels = lowStock.map(item => truncateString(item.name));
      this.stockChart.data.datasets[0].data = lowStock.map(item => item.stock);
      this.stockChart.data.datasets[0].backgroundColor = lowStock.map(item => getStockColor(item.stock));
      this.stockChart.update();
    }
  }

  changeChartView(view: 'daily' | 'weekly' | 'monthly') {
    this.currentTabView.set(view);

    // Update the sales chart based on the new view
    const data = this.dashboardData();
    if (data) {
      this.updateCharts(data);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  }

  getStockStatusClass(stock: number): string {
    if (stock === 0) return 'text-error';
    if (stock <= 2) return 'text-warning';
    return 'text-success';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'Sin stock';
    if (stock <= 2) return 'Crítico';
    return 'Bajo';
  }
}
