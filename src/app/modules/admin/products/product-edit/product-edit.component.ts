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
import { AdminProductService, ProductDetailResponse } from '@app/core/services/admin/admin-product.service';
import { CategoryService } from '@app/core/services/category.service';
import { CategoryResponse } from '@app/core/interfaces/category-response.interface';
import { finalize, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { NotificationService } from '@app/core/services/notification.service';

interface ProductImage {
  id: number;
  url: string;
  file?: File;
  isNew: boolean;
  toDelete: boolean;
  isUpdating?: boolean; // Nueva propiedad para indicar cuando se está actualizando
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

  // Services
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(AdminProductService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService); // Agregamos el servicio de notificaciones

  productForm: FormGroup = this.createForm();

  // Signals
  currentTab = signal<'pricing' | 'inventory'>('pricing');
  productImages = signal<ProductImage[]>([]);
  isManageStock = signal(false);
  isFeatured = signal(false);
  isVisible = signal(true);
  savingProduct = signal(false);
  loadingProduct = signal(true);
  loadingError = signal<string | null>(null);
  productId = signal<number | null>(null);
  categories = signal<CategoryResponse[]>([]);
  productDetail = signal<ProductDetailResponse | null>(null);

  // Tax and stock options
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
    { id: '1', name: 'Activo' },
    { id: '2', name: 'Inactivo' }
  ];

  ngOnInit(): void {
    // Cargar categorías
    this.loadCategories();

    // Obtener ID del producto de la URL y cargar datos
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !isNaN(+id)) {
      this.productId.set(+id);
      this.loadProduct(+id);
    } else {
      this.loadingError.set('ID de producto no válido');
      this.notificationService.error('ID de producto no válido');
      this.loadingProduct.set(false);
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.notificationService.error('Error al cargar las categorías');
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.required]],
        category: ['', [Validators.required]],
        sku: ['']
      }),
      pricing: this.fb.group({
        regularPrice: [0, [Validators.required, Validators.min(0)]],
        salePrice: [0, [Validators.min(0)]]
      }),
      inventory: this.fb.group({
        stock: [0, [Validators.required, Validators.min(0)]],
        lowStockAlert: [5, [Validators.min(0)]]
      }),
      status: this.fb.group({
        status: ['1', [Validators.required]]
      })
    });
  }

  loadProduct(id: number): void {
    this.loadingProduct.set(true);
    this.loadingError.set(null);

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productDetail.set(product);
        this.updateFormWithProductData(product);

        // Convertir las imágenes del producto a nuestro formato interno
        if (product.images && product.images.length > 0) {
          const images: ProductImage[] = product.images.map(img => ({
            id: img.id,
            url: img.imageUrl,
            isNew: false,
            toDelete: false
          }));
          this.productImages.set(images);
        } else {
          // Asegurar que se muestra una lista vacía si no hay imágenes
          this.productImages.set([]);
        }

        this.loadingProduct.set(false);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.loadingError.set(error.message || 'Error al cargar el producto');
        this.notificationService.error('Error al cargar el producto');
        this.loadingProduct.set(false);
      }
    });
  }

  updateFormWithProductData(product: ProductDetailResponse): void {
    // Configurar estados
    this.isVisible.set(product.status === 1);
    this.isManageStock.set(product.stock > 0);

    // Actualizar el formulario con los datos del producto
    this.productForm.patchValue({
      basicInfo: {
        name: product.name,
        description: product.description,
        category: product.category.id.toString(),
        sku: ''  // Si tienes SKU en tu API, aquí deberías asignarlo
      },
      pricing: {
        regularPrice: product.price,
        salePrice: 0  // Si tienes precio de oferta, aquí deberías asignarlo
      },
      inventory: {
        stock: product.stock,
        lowStockAlert: 5  // Si tienes alerta de stock bajo, aquí deberías asignarlo
      },
      status: {
        status: product.status.toString()
      }
    });
  }

  addImage(): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];

        // Crear una URL temporal para mostrar la imagen
        const imageUrl = URL.createObjectURL(file);

        // Añadir la nueva imagen a nuestro array de imágenes
        this.productImages.update(images => [
          ...images,
          {
            id: -Math.floor(Math.random() * 1000), // ID temporal negativo para nuevas imágenes
            url: imageUrl,
            file: file,
            isNew: true,
            toDelete: false
          }
        ]);

        // Notificar al usuario
        this.notificationService.info('Imagen añadida. Guarde los cambios para confirmar.');
      }
    });
    fileInput.click();
  }

  removeImage(index: number): void {
    this.productImages.update(images => {
      const updatedImages = [...images];

      // Si es una imagen existente, la marcamos para eliminar en lugar de quitarla del array
      if (!updatedImages[index].isNew) {
        updatedImages[index].toDelete = true;
        this.notificationService.info('Imagen marcada para eliminar. Guarde los cambios para confirmar.');
      } else {
        // Si es una imagen nueva, simplemente la eliminamos del array
        URL.revokeObjectURL(updatedImages[index].url);
        updatedImages.splice(index, 1);
        this.notificationService.info('Imagen eliminada.');
      }

      return updatedImages;
    });
  }

  updateImage(index: number): void {
    const image = this.productImages()[index];
    if (image.isNew) {
      // Para imágenes nuevas no tiene sentido actualizarlas ya que aún no están en el servidor
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const productId = this.productId();

        if (!productId) {
          this.notificationService.error('ID de producto no válido');
          return;
        }

        // Mostrar indicador de carga solo para esta imagen
        this.productImages.update(images => {
          const updatedImages = [...images];
          updatedImages[index].isUpdating = true;
          return updatedImages;
        });

        // Llamar al servicio para actualizar la imagen
        this.productService.updateProductImage(productId, image.id, file)
          .subscribe({
            next: (response) => {
              // Crear una URL temporal para la nueva imagen
              const imageUrl = URL.createObjectURL(file);

              // Actualizar la imagen en nuestro array
              this.productImages.update(images => {
                const updatedImages = [...images];
                // Liberar la URL anterior
                URL.revokeObjectURL(updatedImages[index].url);

                // Actualizar con la nueva imagen
                updatedImages[index] = {
                  ...updatedImages[index],
                  url: imageUrl,
                  isUpdating: false
                };
                return updatedImages;
              });

              this.notificationService.success('Imagen actualizada correctamente');
            },
            error: (error) => {
              // Quitar el indicador de carga en caso de error
              this.productImages.update(images => {
                const updatedImages = [...images];
                updatedImages[index].isUpdating = false;
                return updatedImages;
              });

              this.notificationService.error(`Error al actualizar la imagen: ${error.message || 'Error desconocido'}`);
            }
          });
      }
    });
    fileInput.click();
  }

  undoRemoveImage(index: number): void {
    this.productImages.update(images => {
      const updatedImages = [...images];
      updatedImages[index].toDelete = false;
      return updatedImages;
    });
    this.notificationService.info('Imagen restaurada');
  }

  setTab(tabName: 'pricing' | 'inventory'): void {
    this.currentTab.set(tabName);
  }

  toggleManageStock(): void {
    this.isManageStock.update(val => !val);
    const newVal = this.isManageStock();
    this.notificationService.info(`Gestión de inventario ${newVal ? 'activada' : 'desactivada'}`);
  }

  toggleFeatured(): void {
    this.isFeatured.update(val => !val);
    const newVal = this.isFeatured();
    this.notificationService.info(`Producto ${newVal ? 'destacado' : 'no destacado'}`);
  }

  toggleVisibility(): void {
    this.isVisible.update(val => !val);

    // Actualizar el estado según la visibilidad
    const newStatus = this.isVisible() ? '1' : '2';
    this.productForm.get('status.status')?.setValue(newStatus);

    // Notificar al usuario
    this.notificationService.info(this.isVisible()
      ? 'Producto visible para clientes'
      : 'Producto oculto para clientes');
  }

  saveChanges(): void {
    if (this.productForm.invalid) {
      this.notificationService.error('Por favor corrige los errores en el formulario antes de guardar.');
      this.markFormGroupTouched(this.productForm);
      return;
    }

    const productId = this.productId();
    if (!productId) {
      this.notificationService.error('ID de producto no válido');
      return;
    }

    this.savingProduct.set(true);

    const formValues = this.productForm.value;

    // Preparar el DTO para la actualización del producto básico
    const updateData = {
      name: formValues.basicInfo.name,
      description: formValues.basicInfo.description,
      price: formValues.pricing.regularPrice,
      stock: formValues.inventory.stock,
      categoryId: parseInt(formValues.basicInfo.category),
      status: parseInt(formValues.status.status)
    };


    // 1. Primero actualizamos los datos básicos del producto
    this.productService.updateProduct(productId, updateData)
      .pipe(
        // Añadir un tap para inspeccionar la respuesta
        tap(response => {
          console.log('Respuesta de actualización:', response);
        }),
        // 2. Luego procesamos las imágenes
        switchMap(() => this.processImagesChanges(productId)),
        finalize(() => this.savingProduct.set(false))
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Producto actualizado correctamente');

          // Recargar los datos del producto para reflejar los cambios
          setTimeout(() => {
            this.loadProduct(productId);
          }, 500); // Pequeño retraso para dar tiempo a que se completen todas las operaciones en el servidor
        },
        error: (error) => {
          this.notificationService.error(`Error al actualizar el producto: ${error.message || 'Error desconocido'}`);
        }
      });
  }

  processImagesChanges(productId: number): Observable<any> {
    const images = this.productImages();

    // Imágenes a eliminar
    const imagesToDelete = images
      .filter(img => !img.isNew && img.toDelete)
      .map(img => this.productService.deleteProductImage(productId, img.id));

    // Imágenes nuevas a añadir
    const imagesToAdd = images
      .filter(img => img.isNew && !img.toDelete && img.file)
      .map(img => this.productService.addProductImage(productId, img.file!));

    // Si no hay imágenes que procesar, devolvemos un observable que completa inmediatamente
    if (imagesToDelete.length === 0 && imagesToAdd.length === 0) {
      return of(null);
    }

    // Combinar todas las operaciones de imágenes
    return forkJoin([...imagesToDelete, ...imagesToAdd]).pipe(
      catchError(error => {
        console.error('Error procesando imágenes:', error);
        return throwError(() => new Error('Error al procesar las imágenes'));
      })
    );
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

  // Métodos de utilidad para gestión de imágenes
  canAddMoreImages(): boolean {
    return this.productImages().filter(img => !img.toDelete).length < 5;
  }

  getActiveImagesCount(): number {
    return this.productImages().filter(img => !img.toDelete).length;
  }

  getNewImagesCount(): number {
    return this.productImages().filter(img => img.isNew && !img.toDelete).length;
  }

  getDeletedImagesCount(): number {
    return this.productImages().filter(img => img.toDelete).length;
  }
}
