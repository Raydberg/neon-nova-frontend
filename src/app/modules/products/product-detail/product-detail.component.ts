import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Star, ShoppingCart, Truck, Shield, ArrowLeft, ArrowRight, Minus, Plus, Check } from 'lucide-angular';
import { Product } from '@shared/components/product-card/product-card.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';

// Interfaces para tipos de datos
interface ProductSpecification {
  nombre: string;
  valor: string;
}

interface ProductWithDetails extends Product {
  stock: number;
  especificaciones: ProductSpecification[];
  imagenes: string[];
  puntuacion: number;
  resenas_count: number;
}

interface Review {
  id: number;
  usuario: string;
  fecha: string;
  calificacion: number;
  comentario: string;
  avatar?: string;
}

@Component({
  selector: 'product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideAngularModule,
    ProductCardComponent
  ],
  templateUrl: './product-detail.component.html',
  styles: [`
    /* Animación para la galería de imágenes */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .fade-in {
      animation: fadeIn 0.3s ease-in-out forwards;
    }

    /* Animación para los botones */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .btn-add-to-cart:hover {
      animation: pulse 0.8s infinite;
    }

    /* Animación para tabs */
    .tab-content {
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease-out;
    }

    .tab-content.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* Animación para miniaturas */
    .thumbnail {
      transition: all 0.2s ease;
    }

    .thumbnail:hover {
      transform: scale(1.05);
      box-shadow: 0 0 0 2px hsl(var(--p));
    }

    .thumbnail.active {
      box-shadow: 0 0 0 2px hsl(var(--p));
      transform: scale(1.05);
    }

    /* Animación para zoom en imagen principal */
    .main-image-container {
      overflow: hidden;
    }

    .main-image {
      transition: transform 0.3s ease;
    }

    .main-image:hover {
      transform: scale(1.05);
    }

    /* Animaciones para reviews */
    .review-item {
      opacity: 0;
      transform: translateY(20px);
      animation: slideUp 0.5s ease forwards;
    }

    @keyframes slideUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .review-item:nth-child(1) { animation-delay: 0.1s; }
    .review-item:nth-child(2) { animation-delay: 0.2s; }
    .review-item:nth-child(3) { animation-delay: 0.3s; }
    .review-item:nth-child(4) { animation-delay: 0.4s; }
    .review-item:nth-child(5) { animation-delay: 0.5s; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent implements OnInit {
  // Iconos
  readonly StarIcon = Star;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly TruckIcon = Truck;
  readonly ShieldIcon = Shield;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly ArrowRightIcon = ArrowRight;
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;

  // Estado reactivo usando señales
  product = signal<ProductWithDetails | null>(null);
  isLoading = signal(true);
  quantity = signal(1);
  currentImageIndex = signal(0);
  activeTab = signal('descripcion');
  relatedProducts = signal<Product[]>([]);
  reviews = signal<Review[]>([]);

  // Valores calculados
  averageRating = computed(() => {
    return this.product()?.puntuacion || 0;
  });

  rating = computed(() => {
    return Math.round(this.averageRating() * 2) / 2; // Redondeo a 0.5 más cercano
  });

  // Inyecciones
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Cargar producto basado en ID de ruta
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        this.loadProduct(Number(productId));
      }
    });
  }

  // Métodos para UI
  setActiveTab(tabId: string): void {
    this.activeTab.set(tabId);
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  increaseQuantity(): void {
    const maxStock = this.product()?.stock || 1;
    if (this.quantity() < maxStock) {
      this.quantity.update(q => q + 1);
    }
  }

  nextImage(): void {
    const images = this.product()?.imagenes || [];
    if (images.length > 0) {
      this.currentImageIndex.update(idx =>
        idx === images.length - 1 ? 0 : idx + 1
      );
    }
  }

  prevImage(): void {
    const images = this.product()?.imagenes || [];
    if (images.length > 0) {
      this.currentImageIndex.update(idx =>
        idx === 0 ? images.length - 1 : idx - 1
      );
    }
  }

  setImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  addToCart(): void {
    // Aquí iría la lógica para añadir al carrito
    console.log(`Añadidos ${this.quantity()} unidades del producto ${this.product()?.id} al carrito`);
    // Animación de éxito o notificación
  }

  buyNow(): void {
    // Aquí iría la lógica para compra directa
    console.log(`Compra directa de ${this.quantity()} unidades del producto ${this.product()?.id}`);
    // Redirigir al checkout
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);

    // Simular carga desde API
    setTimeout(() => {
      // Datos de ejemplo
      this.product.set({
        id: id,
        nombre: "Laptop Pro X",
        descripcion: "La Laptop Pro X combina rendimiento excepcional con un diseño elegante. Equipada con un procesador de última generación, 16GB de RAM y 512GB de almacenamiento SSD, esta laptop es perfecta para profesionales, creativos y gamers. Su pantalla de alta resolución ofrece colores vibrantes y detalles nítidos, mientras que su batería de larga duración te permite trabajar todo el día sin preocupaciones.",
        precio: 1299.99,
        imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
        categoria_id: 1,
        stock: 15,
        puntuacion: 4.5,
        resenas_count: 128,
        imagenes: [
          "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
          "https://images.unsplash.com/photo-1602080858428-57174f9431cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1551&q=80",
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
        ],
        especificaciones: [
          { nombre: "Procesador", valor: "Intel Core i7 de 12ª generación" },
          { nombre: "Memoria RAM", valor: "16GB DDR4" },
          { nombre: "Almacenamiento", valor: "512GB SSD NVMe" },
          { nombre: "Pantalla", valor: '15.6" 4K Ultra HD' },
          { nombre: "Tarjeta gráfica", valor: "NVIDIA GeForce RTX 3060" },
          { nombre: "Sistema operativo", valor: "Windows 11 Pro" },
          { nombre: "Batería", valor: "Hasta 10 horas de duración" },
          { nombre: "Peso", valor: "1.8 kg" },
        ]
      });

      // Cargar productos relacionados
      this.loadRelatedProducts(this.product()?.categoria_id || 0);

      // Cargar reseñas
      this.loadReviews(id);

      this.isLoading.set(false);
    }, 800);
  }

  private loadRelatedProducts(categoryId: number): void {
    // Simular carga de productos relacionados
    setTimeout(() => {
      this.relatedProducts.set([
        {
          id: 7,
          nombre: "Tablet Pro 12",
          descripcion: "Tablet de 12 pulgadas con pantalla retina",
          precio: 649.99,
          imagen: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1631&q=80",
          categoria_id: 1
        },
        {
          id: 8,
          nombre: "Monitor Curvo 32\"",
          descripcion: "Monitor gaming curvo de 32 pulgadas",
          precio: 349.99,
          imagen: "https://images.unsplash.com/photo-1555626906-fcf10d6851b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          categoria_id: 1
        },
        {
          id: 9,
          nombre: "Laptop UltraSlim",
          descripcion: "Laptop ligera con gran autonomía",
          precio: 899.99,
          imagen: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
          categoria_id: 1
        },
        {
          id: 10,
          nombre: "Dock Station Pro",
          descripcion: "Estación de acoplamiento para portátiles",
          precio: 129.99,
          imagen: "https://images.unsplash.com/photo-1625242662167-9ba73d268139?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          categoria_id: 1
        }
      ]);
    }, 1000);
  }

  private loadReviews(productId: number): void {
    // Simular carga de reseñas
    setTimeout(() => {
      this.reviews.set([
        {
          id: 1,
          usuario: "Ana García",
          fecha: "2023-11-15",
          calificacion: 5,
          comentario: "Excelente laptop, muy rápida y con una batería que dura todo el día. La recomiendo totalmente.",
          avatar: "https://i.pravatar.cc/150?img=1"
        },
        {
          id: 2,
          usuario: "Miguel Rodríguez",
          fecha: "2023-10-28",
          calificacion: 4,
          comentario: "Muy buena compra. El rendimiento es excelente aunque el ventilador es un poco ruidoso cuando se exige mucho.",
          avatar: "https://i.pravatar.cc/150?img=2"
        },
        {
          id: 3,
          usuario: "Laura Torres",
          fecha: "2023-09-12",
          calificacion: 5,
          comentario: "Superó mis expectativas. La pantalla tiene unos colores increíbles y el teclado es muy cómodo.",
          avatar: "https://i.pravatar.cc/150?img=3"
        }
      ]);
    }, 1200);
  }

  // Método para generar array para estrellas
  ratingToArray(rating: number): number[] {
    const result = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
      result.push(1);
    }

    // Media estrella si es necesario
    if (hasHalfStar) {
      result.push(0.5);
    }

    // Estrellas vacías
    while (result.length < 5) {
      result.push(0);
    }

    return result;
  }
}
