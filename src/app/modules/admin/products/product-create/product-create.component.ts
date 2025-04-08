import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  ArrowLeftIcon,
  ImagePlusIcon,
  UploadIcon,
  Trash2Icon,
  DollarSignIcon
} from 'lucide-angular';
import { Product } from '../../../../shared/components/product-card/product-card.component';

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
  // Icons
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly ImagePlusIcon = ImagePlusIcon;
  readonly UploadIcon = UploadIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly DollarSignIcon = DollarSignIcon;

  // Form handling
  private fb = inject(FormBuilder);
  productForm: FormGroup = this.createForm();

  // Signals
  currentTab = signal<'pricing' | 'inventory'>('pricing');
  images = signal<string[]>([]);
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
    { id: 'published', name: 'Publicado' },
    { id: 'draft', name: 'Borrador' },
    { id: 'pending', name: 'Pendiente de revisión' }
  ];

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
        status: ['draft', [Validators.required]],
        meta: this.fb.group({
          title: ['', [Validators.maxLength(70)]],
          description: ['', [Validators.maxLength(160)]]
        })
      }),
      additionalCategories: this.fb.array([])
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

  saveDraft(): void {
    this.saveProduct('draft');
  }

  publishProduct(): void {
    this.saveProduct('published');
  }

  private saveProduct(status: string): void {
    // Update the status control value
    this.productForm.get('status.status')?.setValue(status);

    if (this.productForm.invalid) {
      this.errorMessage.set('Por favor corrige los errores en el formulario antes de guardar.');
      this.markFormGroupTouched(this.productForm);
      return;
    }

    this.savingProduct.set(true);
    this.errorMessage.set(null);

    // In a real application, this would be a service call
    setTimeout(() => {
      // Simulate API call
      console.log('Producto guardado:', {
        ...this.productForm.value,
        images: this.images()
      });
      this.savingProduct.set(false);
      // Here you would redirect to the products list or show success message
    }, 1500);
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
