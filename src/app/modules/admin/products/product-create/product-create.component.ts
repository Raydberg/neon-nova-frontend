import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {AdminProductService} from '@app/core/services/admin/admin-product.service';

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

  productForm: FormGroup = this.createForm();

  // Signals
  currentTab = signal<'pricing' | 'inventory'>('pricing');
  images = signal<File[]>([]);
  imageUrls = signal<string[]>([]);
  isManageStock = signal(false);
  isFeatured = signal(false);
  isVisible = signal(true);
  savingProduct = signal(false);
  errorMessage = signal<string | null>(null);
  selectedCategories = signal<number[]>([]);

  // Mock data
  categories = signal<Category[]>([
    {id: 1, name: 'Laptops'},
    {id: 2, name: 'Smartphones'},
    {id: 3, name: 'Audio'},
    {id: 4, name: 'Wearables'},
    {id: 5, name: 'Cámaras'},
    {id: 6, name: 'Televisores'},
    {id: 7, name: 'Gaming'},
    {id: 8, name: 'Impresoras'}
  ]);

  taxClasses = [
    {id: 'standard', name: 'Estándar'},
    {id: 'reduced', name: 'Reducido'},
    {id: 'zero', name: 'Sin impuesto'}
  ];

  stockStatuses = [
    {id: 'in-stock', name: 'En stock'},
    {id: 'out-of-stock', name: 'Agotado'},
    {id: 'on-backorder', name: 'Pedido pendiente'}
  ];

  productStatuses = [
    {id: '1', name: 'Activo'},
    {id: '2', name: 'Inactivo'},
    {id: '3', name: 'Sin stock'}
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
        status: ['1', [Validators.required]],
        meta: this.fb.group({
          title: ['', [Validators.maxLength(70)]],
          description: ['', [Validators.maxLength(160)]]
        })
      }),
      additionalCategories: this.fb.array([])
    });
  }

  // Method to handle file upload
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const newFiles = Array.from(input.files);

      if (this.images().length + newFiles.length > 5) {
        this.errorMessage.set('Máximo 5 imágenes permitidas');
        return;
      }

      const currentFiles = this.images();
      const currentUrls = this.imageUrls();
      const newUrls: string[] = [];

      newFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      });

      this.images.set([...currentFiles, ...newFiles]);
      this.imageUrls.set([...currentUrls, ...newUrls]);

      input.value = '';
    }
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.imageUrls()[index]);

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

  // New methods for category handling
  toggleCategory(categoryId: number): void {
    const current = this.selectedCategories();
    if (current.includes(categoryId)) {
      // If category is already selected, unselect it
      this.selectedCategories.set(current.filter(id => id !== categoryId));

      // If it was the main category, clear that field
      if (this.productForm.get('basicInfo.category')?.value === categoryId.toString()) {
        this.productForm.get('basicInfo.category')?.setValue('');
      }
    } else {
      // If category is not selected, select it
      this.selectedCategories.set([...current, categoryId]);

      // If no main category is set, set this as the main category
      if (!this.productForm.get('basicInfo.category')?.value) {
        this.productForm.get('basicInfo.category')?.setValue(categoryId.toString());
      }
    }
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories().includes(categoryId);
  }


  // Save methods
  saveDraft(): void {
    this.saveProduct('2');
  }

  publishProduct(): void {
    this.saveProduct('1');
  }

  private saveProduct(status: string): void {
    // Update the status in the form
    this.productForm.get('status.status')?.setValue(status);

    if (this.productForm.invalid) {
      this.errorMessage.set('Por favor corrige los errores en el formulario antes de guardar.');
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.savingProduct.set(true);
    this.errorMessage.set(null);

    // Prepare data to send
    const formValues = this.productForm.value;
    const productData = {
      name: formValues.basicInfo.name,
      description: formValues.basicInfo.description,
      price: formValues.pricing.regularPrice,
      stock: formValues.inventory.stock,
      categoryId: parseInt(formValues.basicInfo.category),
      status: parseInt(formValues.status.status)
    };

    // Send to service
    this.productService.createProduct(productData, this.images()).subscribe({
      next: (response) => {
        console.log('Producto creado con éxito:', response);
        this.savingProduct.set(false);
        // Redirect to product list
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
