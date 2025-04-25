import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AdminProductService } from '@app/core/services/admin/admin-product.service';
// import { ToastService } from '@app/core/services/toast.service'; // Asume que tienes un servicio de notificaciones

interface Category {
  id: number;
  name: string;
}

interface TabView {
  pricing: boolean;
  inventory: boolean;
}

@Component({
  selector: 'admin-product-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './product-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private productService = inject(AdminProductService);
  private router = inject(Router);
  // private toastService = inject(ToastService); // Para notificaciones

  productForm: FormGroup = this.createForm();

  // Signals
  currentTab = signal<'pricing' | 'inventory'>('pricing');
  images = signal<File[]>([]); // Cambiado para almacenar objetos File
  imageUrls = signal<string[]>([]); // URLs para vista previa
  isManageStock = signal(false);
  isFeatured = signal(false);
  isVisible = signal(true);
  savingProduct = signal(false);
  errorMessage = signal<string | null>(null);

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
    { id: '1', name: 'Activo' }, // Cambiado a string para facilitar la conversión
    { id: '2', name: 'Inactivo' },
    { id: '3', name: 'Sin stock' }
  ];

  createForm(): FormGroup {
    return this.fb.group({
      basicInfo: this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(500)]],
        description: ['', [Validators.required, Validators.maxLength(500)]],
        category: ['', [Validators.required]],
        sku: ['', [Validators.maxLength(50)]]
      }),
      pricing: this.fb.group({
        regularPrice: [0, [Validators.required, Validators.min(0)]],
        salePrice: [0, [Validators.min(0)]],
        taxClass: ['standard', [Validators.required]]
      }),
      inventory: this.fb.group({
        stock: [0, [Validators.required, Validators.min(0)]],
        lowStockAlert: [5, [Validators.min(0)]],
        stockStatus: ['in-stock', [Validators.required]]
      }),
      status: this.fb.group({
        status: ['1', [Validators.required]], // Cambiado a '1' (Active)
        meta: this.fb.group({
          title: ['', [Validators.maxLength(70)]],
          description: ['', [Validators.maxLength(160)]]
        })
      }),
      additionalCategories: this.fb.array([])
    });
  }

  // Método para manejar la carga de archivos
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      // Obtener los archivos seleccionados
      const newFiles = Array.from(input.files);

      // Validar que no excedamos el límite de 5 imágenes
      if (this.images().length + newFiles.length > 5) {
        this.errorMessage.set('Máximo 5 imágenes permitidas');
        return;
      }

      // Añadir nuevos archivos
      const currentFiles = this.images();
      const currentUrls = this.imageUrls();
      const newUrls: string[] = [];

      // Generar URLs para vista previa
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      });

      // Actualizar signals
      this.images.set([...currentFiles, ...newFiles]);
      this.imageUrls.set([...currentUrls, ...newUrls]);

      // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
      input.value = '';
    }
  }

  removeImage(index: number): void {
    // Liberar URL para evitar memory leaks
    URL.revokeObjectURL(this.imageUrls()[index]);

    // Actualizar signals removiendo el elemento en el índice dado
    this.images.update(imgs => imgs.filter((_, i) => i !== index));
    this.imageUrls.update(urls => urls.filter((_, i) => i !== index));
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

  saveDraft(): void {
    this.saveProduct('2'); // Inactivo
  }

  publishProduct(): void {
    this.saveProduct('1'); // Activo
  }

  private saveProduct(status: string): void {
    // Actualizar el status en el formulario
    this.productForm.get('status.status')?.setValue(status);

    if (this.productForm.invalid) {
      this.errorMessage.set('Por favor corrige los errores en el formulario antes de guardar.');
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.savingProduct.set(true);
    this.errorMessage.set(null);

    // Preparar datos para enviar
    const formValues = this.productForm.value;
    const productData = {
      name: formValues.basicInfo.name,
      description: formValues.basicInfo.description,
      price: formValues.pricing.regularPrice,
      stock: formValues.inventory.stock,
      categoryId: parseInt(formValues.basicInfo.category),
      status: parseInt(formValues.status.status)
    };

    // Enviar al servicio
    this.productService.createProduct(productData, this.images()).subscribe({
      next: (response) => {
        console.log('Producto creado con éxito:', response);
        this.savingProduct.set(false);
        // this.toastService.show({
        //   message: 'Producto creado con éxito',
        //   type: 'success'
        // });
        // Redirigir a la lista de productos
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        console.error('Error al crear el producto:', error);
        this.savingProduct.set(false);
        this.errorMessage.set(`Error al crear el producto: ${error.message || 'Error desconocido'}`);
      }
    });
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
}
