import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';

import { Order, OrderItem } from '../order-list/order-list.component';

interface Address {
  name: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrderStep {
  status: string;
  date: Date;
  completed: boolean;
  current: boolean;
}

interface OrderDetail extends Order {
  customerEmail: string;
  shippingAddress: Address;
  paymentMethod: string;
  estimatedDelivery?: Date;
  steps: OrderStep[];
}

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './order-detail.component.html',
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    :host {
      display: block;
      animation: fadeIn 0.5s ease-out forwards;
    }

    .product-item {
      transition: all 0.2s ease;
    }

    .product-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .stepper-item:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 32px;
      left: 16px;
      height: calc(100% - 32px);
      border-left: 2px dashed #ddd;
    }

    .stepper-item.completed:not(:last-child)::after {
      border-left: 2px solid hsl(var(--p));
    }

    .step-circle {
      transition: all 0.3s ease;
    }

    .completed .step-circle {
      background-color: hsl(var(--p));
      color: white;
      transform: scale(1.1);
    }

    .current .step-circle {
      border: 2px solid hsl(var(--p));
      background-color: white;
      color: hsl(var(--p));
      transform: scale(1.2);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(var(--p), 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(var(--p), 0); }
      100% { box-shadow: 0 0 0 0 rgba(var(--p), 0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent implements OnInit {
  // Iconos

  // Inyecciones
  private route = inject(ActivatedRoute);

  // Estado
  order = signal<OrderDetail | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Obtener el ID del pedido desde la URL
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.error.set('No se especificó un ID de pedido válido');
        this.isLoading.set(false);
      }
    });
  }

  // Métodos para UI
  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered':
        return 'text-success';
      case 'shipped':
        return 'text-info';
      case 'processing':
        return 'text-warning';
      case 'pending':
        return 'text-primary';
      case 'cancelled':
        return 'text-error';
      default:
        return '';
    }
  }

  getBadgeClass(status: string): string {
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

  shareOrder(): void {
    // Implementación de compartir (podría usar navigator.share API)
    if (navigator.share) {
      navigator.share({
        title: `Pedido #${this.order()?.id}`,
        text: `Mi pedido #${this.order()?.id} de Neon Nova`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Enlace copiado al portapapeles'));
    }
  }

  printOrder(): void {
    window.print();
  }

  // Formatters
  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Cargar datos del pedido
  private loadOrderDetails(orderId: string): void {
    // Simulación de carga de datos - en una app real, esto sería un servicio
    setTimeout(() => {
      try {
        // Ejemplos de órdenes con diferentes estados
        let testOrder: OrderDetail;

        switch (orderId) {
          case 'ORD-12345':
            testOrder = {
              id: 'ORD-12345',
              date: new Date(2023, 9, 25),
              total: 1299.99,
              status: 'delivered',
              customerEmail: 'usuario@email.com',
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
              shippingAddress: {
                name: "Juan Pérez",
                street: "Calle Principal 123",
                city: "Madrid",
                zipCode: "28001",
                country: "España",
                phone: "+34 612345678"
              },
              paymentMethod: "Tarjeta de crédito",
              estimatedDelivery: new Date(2023, 9, 30),
              trackingNumber: 'TRK4589612378',
              steps: [
                {
                  status: 'Pedido recibido',
                  date: new Date(2023, 9, 25, 14, 30),
                  completed: true,
                  current: false
                },
                {
                  status: 'Pago confirmado',
                  date: new Date(2023, 9, 25, 14, 35),
                  completed: true,
                  current: false
                },
                {
                  status: 'Preparando pedido',
                  date: new Date(2023, 9, 26, 10, 15),
                  completed: true,
                  current: false
                },
                {
                  status: 'Enviado',
                  date: new Date(2023, 9, 27, 9, 45),
                  completed: true,
                  current: false
                },
                {
                  status: 'Entregado',
                  date: new Date(2023, 9, 30, 12, 20),
                  completed: true,
                  current: true
                }
              ]
            };
            break;
          case 'ORD-12346':
            testOrder = {
              id: 'ORD-12346',
              date: new Date(2023, 9, 28),
              total: 499.98,
              status: 'shipped',
              customerEmail: 'usuario@email.com',
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
              shippingAddress: {
                name: "Juan Pérez",
                street: "Calle Principal 123",
                city: "Madrid",
                zipCode: "28001",
                country: "España",
                phone: "+34 612345678"
              },
              paymentMethod: "PayPal",
              estimatedDelivery: new Date(2023, 11, 2),
              trackingNumber: 'TRK7896543210',
              steps: [
                {
                  status: 'Pedido recibido',
                  date: new Date(2023, 9, 28, 16, 45),
                  completed: true,
                  current: false
                },
                {
                  status: 'Pago confirmado',
                  date: new Date(2023, 9, 28, 16, 48),
                  completed: true,
                  current: false
                },
                {
                  status: 'Preparando pedido',
                  date: new Date(2023, 9, 29, 11, 30),
                  completed: true,
                  current: false
                },
                {
                  status: 'Enviado',
                  date: new Date(2023, 9, 31, 9, 15),
                  completed: true,
                  current: true
                },
                {
                  status: 'Entregado',
                  date: new Date(2023, 11, 2),
                  completed: false,
                  current: false
                }
              ]
            };
            break;
          case 'ORD-12347':
            testOrder = {
              id: 'ORD-12347',
              date: new Date(2023, 10, 2),
              total: 1049.98,
              status: 'processing',
              customerEmail: 'usuario@email.com',
              items: [
                {
                  id: 3,
                  product_id: 5,
                  name: "Cámara DSLR 4K",
                  price: 1049.98,
                  quantity: 1,
                  image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                }
              ],
              shippingAddress: {
                name: "Juan Pérez",
                street: "Calle Principal 123",
                city: "Madrid",
                zipCode: "28001",
                country: "España",
                phone: "+34 612345678"
              },
              paymentMethod: "Transferencia bancaria",
              estimatedDelivery: new Date(2023, 11, 7),
              steps: [
                {
                  status: 'Pedido recibido',
                  date: new Date(2023, 10, 2, 10, 20),
                  completed: true,
                  current: false
                },
                {
                  status: 'Pago confirmado',
                  date: new Date(2023, 10, 2, 14, 45),
                  completed: true,
                  current: false
                },
                {
                  status: 'Preparando pedido',
                  date: new Date(2023, 10, 3, 9, 30),
                  completed: true,
                  current: true
                },
                {
                  status: 'Enviado',
                  date: new Date(),
                  completed: false,
                  current: false
                },
                {
                  status: 'Entregado',
                  date: new Date(),
                  completed: false,
                  current: false
                }
              ]
            };
            break;
          case 'ORD-12348':
            testOrder = {
              id: 'ORD-12348',
              date: new Date(2023, 10, 5),
              total: 199.99,
              status: 'pending',
              customerEmail: 'usuario@email.com',
              items: [
                {
                  id: 4,
                  product_id: 4,
                  name: "Smartwatch Fitness Pro",
                  price: 199.99,
                  quantity: 1,
                  image: "https://images.unsplash.com/photo-1617043786395-f977fa12eddf?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                }
              ],
              shippingAddress: {
                name: "Juan Pérez",
                street: "Calle Principal 123",
                city: "Madrid",
                zipCode: "28001",
                country: "España",
                phone: "+34 612345678"
              },
              paymentMethod: "MercadoPago",
              steps: [
                {
                  status: 'Pedido recibido',
                  date: new Date(2023, 10, 5, 18, 20),
                  completed: true,
                  current: true
                },
                {
                  status: 'Pago confirmado',
                  date: new Date(),
                  completed: false,
                  current: false
                },
                {
                  status: 'Preparando pedido',
                  date: new Date(),
                  completed: false,
                  current: false
                },
                {
                  status: 'Enviado',
                  date: new Date(),
                  completed: false,
                  current: false
                },
                {
                  status: 'Entregado',
                  date: new Date(),
                  completed: false,
                  current: false
                }
              ]
            };
            break;
          case 'ORD-12349':
            testOrder = {
              id: 'ORD-12349',
              date: new Date(2023, 9, 22),
              total: 349.99,
              status: 'cancelled',
              customerEmail: 'usuario@email.com',
              items: [
                {
                  id: 5,
                  product_id: 8,
                  name: "Monitor Curvo 32\"",
                  price: 349.99,
                  quantity: 1,
                  image: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"
                }
              ],
              shippingAddress: {
                name: "Juan Pérez",
                street: "Calle Principal 123",
                city: "Madrid",
                zipCode: "28001",
                country: "España",
                phone: "+34 612345678"
              },
              paymentMethod: "Tarjeta de débito",
              steps: [
                {
                  status: 'Pedido recibido',
                  date: new Date(2023, 9, 22, 9, 15),
                  completed: true,
                  current: false
                },
                {
                  status: 'Pago confirmado',
                  date: new Date(2023, 9, 22, 9, 18),
                  completed: true,
                  current: false
                },
                {
                  status: 'Cancelado por el usuario',
                  date: new Date(2023, 9, 22, 11, 45),
                  completed: true,
                  current: true
                }
              ]
            };
            break;
          default:
            throw new Error('Pedido no encontrado');
        }

        this.order.set(testOrder);
        this.isLoading.set(false);
      } catch (err: any) {
        this.error.set(err.message || 'Error al cargar el pedido');
        this.isLoading.set(false);
      }
    }, 800);
  }
}
