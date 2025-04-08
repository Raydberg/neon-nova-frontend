import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  ImagePlusIcon,
  UploadIcon,
  Trash2Icon,
  DollarSignIcon,
  SaveIcon,
  AlertTriangleIcon
} from 'lucide-angular';
import { Product } from '../../../../shared/components/product-card/product-card.component';

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'admin-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './product-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent implements OnInit {
  // Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly ImagePlusIcon = ImagePlusIcon;
  readonly UploadIcon = UploadIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly DollarSignIcon = DollarSignIcon;
  readonly SaveIcon = SaveIcon;
  readonly AlertTriangleIcon = AlertTriangleIcon;

  // Form handling
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm: FormGroup = this.createForm();

  // Señales
  currentTab = signal<'pricing' | 'inventory'>('pricing');
  images = signal<string[]>([]);
  isManageStock = signal(false);
  isFeatured = signal(false);
  isVisible = signal(true);
  savingProduct = signal(false);
  loadingProduct = signal(true);
  errorMessage = signal<string | null>(null);
  loadingError = signal<string | null>(null);
  productId = signal<number | null>(null);

  // Mock data
  categories = signal<Category[]>([
    { id: 1, name: 'Laptops' },
    { id: 2, name: 'Smartphones' },
    { id: 3, name: 'Audio' },
    { id: 4, name: 'Wearables' },
    { id: 5, name: 'Cámaras' },
    { id: 6, name: 'Televisores' },
    { id: 7, name: 'Gaming' },
    { id: 8, name: 'Impresoras' }
  ]);

  taxClasses = [
    { id: 'standard', name: 'Estándar' },
    { id: 'reduced', name: 'Reducido' },
    { id: 'zero', name: 'Sin impuesto' }
  ];

  stockStatuses = [
    { id: 'in-stock', name: 'En stock' },
    { id: 'out-of-stock', name: 'Agotado' },
    { id: 'on-backorder', name: 'Pedido pendiente' }
  ];

  productStatuses = [
    { id: 'published', name: 'Publicado' },
    { id: 'draft', name: 'Borrador' },
    { id: 'pending', name: 'Pendiente de revisión' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.productId.set(+id);
      this.loadProduct(+id);
    } else {
      this.loadingError.set('ID de producto no válido');
      this.loadingProduct.set(false);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.required]],
        category: ['', [Validators.required]],
        sku: ['', [Validators.maxLength(50)]]
      }),
      pricing: this.fb.group({
        regularPrice: [0, [Validators.required, Validators.min(0)]],
        salePrice: [0, [Validators.min(0)]],
        taxClass: ['standard', [Validators.required]]
      }),
      inventory: this.fb.group({
        stock: [0, [Validators.min(0)]],
        lowStockAlert: [5, [Validators.min(0)]],
        stockStatus: ['in-stock', [Validators.required]]
      }),
      status: this.fb.group({
        status: ['published', [Validators.required]],
        meta: this.fb.group({
          title: ['', [Validators.maxLength(70)]],
          description: ['', [Validators.maxLength(160)]]
        })
      }),
      additionalCategories: this.fb.array([])
    });
  }

  loadProduct(id: number): void {
    this.loadingProduct.set(true);
    this.loadingError.set(null);

    // En una aplicación real, aquí llamarías a un servicio para obtener los datos del producto
    // Simulamos una llamada a API con un timeout
    setTimeout(() => {
      try {
        // Simulamos obtener los datos del producto
        const product = this.getMockProduct(id);

        if (product) {
          this.updateFormWithProductData(product);
          this.loadingProduct.set(false);
        } else {
          this.loadingError.set('No se encontró el producto');
          this.loadingProduct.set(false);
        }
      } catch (error) {
        this.loadingError.set('Error al cargar el producto');
        this.loadingProduct.set(false);
      }
    }, 800);
  }

  updateFormWithProductData(product: any): void {
    // Actualizamos las señales
    this.images.set(product.images || []);
    this.isManageStock.set(product.manageStock || false);
    this.isFeatured.set(product.featured || false);
    this.isVisible.set(product.visible !== false);

    // Actualizamos el formulario
    this.productForm.patchValue({
      basicInfo: {
        name: product.nombre,
        description: product.descripcion,
        category: product.categoria_id,
        sku: product.sku || ''
      },
      pricing: {
        regularPrice: product.precio,
        salePrice: product.precioOferta || 0,
        taxClass: product.taxClass || 'standard'
      },
      inventory: {
        stock: product.stock || 0,
        lowStockAlert: product.lowStockAlert || 5,
        stockStatus: product.stockStatus || 'in-stock'
      },
      status: {
        status: product.activo ? 'published' : 'draft',
        meta: {
          title: product.metaTitle || '',
          description: product.metaDescription || ''
        }
      }
    });
  }

  addImage(): void {
    if (this.images().length < 5) {
      this.images.update(imgs => [...imgs, `/assets/images/placeholder.png?text=Imagen+${imgs.length + 1}`]);
    }
  }

  removeImage(index: number): void {
    this.images.update(imgs => imgs.filter((_, i) => i !== index));
  }

  setTab(tabName: 'pricing' | 'inventory'): void {
    this.currentTab.set(tabName);
  }

  toggleManageStock(): void {
    this.isManageStock.update(val => !val);
  }

  toggleFeatured(): void {
    this.isFeatured.update(val => !val);
  }

  toggleVisibility(): void {
    this.isVisible.update(val => !val);
  }

  saveChanges(): void {
    if (this.productForm.invalid) {
      this.errorMessage.set('Por favor corrige los errores en el formulario antes de guardar.');
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.savingProduct.set(true);
    this.errorMessage.set(null);

    // En una aplicación real, esto sería una llamada a un servicio
    setTimeout(() => {
      // Simulamos guardar cambios
      console.log('Producto actualizado:', {
        id: this.productId(),
        ...this.productForm.value,
        images: this.images(),
        manageStock: this.isManageStock(),
        featured: this.isFeatured(),
        visible: this.isVisible()
      });

      this.savingProduct.set(false);
      // Redirigir a la lista de productos o mostrar un mensaje de éxito
      this.router.navigate(['/admin/products']);
    }, 1500);
  }

  cancelEdit(): void {
    this.router.navigate(['/admin/products']);
  }

  // Helper function to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Simulación de datos para el ejemplo
  private getMockProduct(id: number): any {
    // Datos simulados para edición, basados en los productos de muestra
    const products = [
      {
        id: 1,
        nombre: "Laptop Pro X",
        descripcion: "Potente laptop con procesador de última generación",
        precio: 1299.99,
        imagen: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
        categoria_id: 1,
        puntuacion: 4.5,
        stock: 15,
        activo: true,
        sku: "LAP-001",
        images: [
          "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
          "/assets/images/placeholder.png?text=Imagen+2"
        ],
        manageStock: true,
        lowStockAlert: 5,
        featured: true,
        stockStatus: "in-stock",
        metaTitle: "Laptop Pro X - Alta Potencia",
        metaDescription: "La mejor laptop para profesionales exigentes."
      },
      {
        id: 2,
        nombre: "Smartphone Galaxy Ultra",
        descripcion: "Smartphone con cámara profesional y batería de larga duración",
        precio: 899.99,
        imagen: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80",
        categoria_id: 2,
        puntuacion: 4.8,
        stock: 23,
        activo: true,
        sku: "PHONE-001",
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1227&q=80"
        ],
        manageStock: true,
        lowStockAlert: 3,
        featured: true,
        stockStatus: "in-stock"
      }
    ];

    return products.find(p => p.id === id);
  }
}
