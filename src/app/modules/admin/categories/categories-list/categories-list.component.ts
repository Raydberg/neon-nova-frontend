import {ChangeDetectionStrategy, Component, inject, signal, OnInit, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {debounceTime, finalize} from 'rxjs/operators';
import {rxResource} from '@angular/core/rxjs-interop';
import {AdminCategoryService} from '@app/core/services/admin/admin-category.service';
import {CategoryModel, Item} from '@app/core/models/category-model';
import {NotificationService} from '@app/core/services/notification.service';

@Component({
  selector: 'admin-categories-list',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './categories-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent implements OnInit {
  private categoryService = inject(AdminCategoryService);
  private notificationService = inject(NotificationService);

  // Resource for loading categories
  categoryResource = rxResource({
    loader: () => this.categoryService.getAllCategories()
  });

  // Signals for category data
  categoryItems = signal<Item[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  categoryToEdit = signal<Item | null>(null);
  categoryToDelete = signal<Item | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Form controls
  searchControl = new FormControl('');
  nameControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);

  // Filtered categories based on search
  filteredCategories = signal<Item[]>([]);

  constructor() {
    effect(() => {
      const result = this.categoryResource.value();
      if (result?.items) {
        this.categoryItems.set(result.items || []);
        this.filteredCategories.set(result.items || []);
        this.currentPage.set(result.pageNumber);
        this.totalPages.set(result.totalPages);
      }
    });

    // Manejar errores de carga
    effect(() => {
      const error = this.categoryResource.error();
      if (error) {
        this.notificationService.error('Error al cargar las categorías. Por favor, intenta nuevamente.');
      }
    });
  }

  ngOnInit() {
    // Load categories
    this.categoryResource.reload();

    // Subscribe to search control changes
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.filterCategories(value || '');
    });
  }

  filterCategories(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredCategories.set(this.categoryItems());
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = this.categoryItems().filter(cat =>
      cat.name.toLowerCase().includes(lowerSearch) ||
      cat.description.toLowerCase().includes(lowerSearch)
    );

    this.filteredCategories.set(filtered);

    // Notificar al usuario si no se encontraron resultados
    if (filtered.length === 0 && this.categoryItems().length > 0) {
      this.notificationService.info(`No se encontraron categorías que coincidan con "${searchTerm}"`);
    }
  }

  // Pagination methods
  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      // Implementa carga de la página anterior desde la API
      this.loadPage(this.currentPage());
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      // Implementa carga de la página siguiente desde la API
      this.loadPage(this.currentPage());
    }
  }

  loadPage(page: number) {
    // En una implementación real, aquí llamarías a la API con parámetros de paginación
    // Por ahora, simplemente recargamos los datos
    this.categoryResource.reload();
    this.notificationService.info(`Cargando página ${page}`);
  }

  openAddModal() {
    this.errorMessage.set(null);
    this.nameControl.setValue('');
    this.descriptionControl.setValue('');
    this.showAddModal.set(true);
  }

  openEditModal(category: Item) {
    this.errorMessage.set(null);
    this.categoryToEdit.set(category);
    this.nameControl.setValue(category.name);
    this.descriptionControl.setValue(category.description);
    this.showEditModal.set(true);
  }

  openDeleteModal(category: Item) {
    this.errorMessage.set(null);
    this.categoryToDelete.set(category);
    this.showDeleteModal.set(true);
  }

  closeModals() {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.categoryToEdit.set(null);
    this.categoryToDelete.set(null);
    this.errorMessage.set(null);
  }

  addCategory() {
    if (!this.isFormValid()) return;

    const name = this.nameControl.value!;
    const description = this.descriptionControl.value!;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.categoryService.createCategory({ name, description })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (newCategory) => {
          // Actualizar lista de categorías
          this.categoryItems.update(cats => [...cats, newCategory]);
          this.filteredCategories.set(this.categoryItems());
          this.closeModals();
          // Recargar datos para asegurar sincronización con el servidor
          this.categoryResource.reload();

          // Mostrar notificación de éxito
          this.notificationService.success(`Categoría "${name}" creada correctamente`);
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.errorMessage.set('No se pudo crear la categoría. Por favor, inténtalo de nuevo.');

          // Mostrar notificación de error
          this.notificationService.error(`Error al crear la categoría "${name}"`);
        }
      });
  }

  saveCategory() {
    if (!this.isFormValid()) return;

    const category = this.categoryToEdit();
    if (!category) return;

    const name = this.nameControl.value!;
    const description = this.descriptionControl.value!;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.categoryService.updateCategory(category.id, { name, description })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (updatedCategory) => {
          // Actualizar lista de categorías
          this.categoryItems.update(cats =>
            cats.map(c => c.id === category.id ? updatedCategory : c)
          );
          this.filteredCategories.set(this.categoryItems());
          this.closeModals();
          // Recargar datos para asegurar sincronización con el servidor
          this.categoryResource.reload();

          // Mostrar notificación de éxito
          this.notificationService.success(`Categoría "${name}" actualizada correctamente`);
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.errorMessage.set('No se pudo actualizar la categoría. Por favor, inténtalo de nuevo.');

          // Mostrar notificación de error
          this.notificationService.error(`Error al actualizar la categoría "${name}"`);
        }
      });
  }

  deleteCategory() {
    const category = this.categoryToDelete();
    if (!category) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.categoryService.deleteCategory(category.id)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          // Eliminar categoría de la lista local
          this.categoryItems.update(cats =>
            cats.filter(c => c.id !== category.id)
          );
          this.filteredCategories.set(this.categoryItems());
          this.closeModals();
          // Recargar datos para asegurar sincronización con el servidor
          this.categoryResource.reload();

          // Mostrar notificación de éxito
          this.notificationService.success(`Categoría "${category.name}" eliminada correctamente`);
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
          this.errorMessage.set('No se pudo eliminar la categoría. Por favor, inténtalo de nuevo.');

          // Mostrar mensaje de error más detallado si hay productos asociados
          if (error.status === 400) {
            this.notificationService.error(`No se puede eliminar la categoría "${category.name}" porque tiene productos asociados`);
          } else {
            this.notificationService.error(`Error al eliminar la categoría "${category.name}"`);
          }
        }
      });
  }

  isFormValid(): boolean {
    if (this.nameControl.invalid) {
      this.nameControl.markAsTouched();
      this.errorMessage.set('El nombre de la categoría es obligatorio.');

      // Mostrar notificación de error de formulario
      this.notificationService.warning('El nombre de la categoría es obligatorio.');
      return false;
    }

    if (this.descriptionControl.invalid) {
      this.descriptionControl.markAsTouched();
      this.errorMessage.set('La descripción de la categoría es obligatoria.');

      // Mostrar notificación de error de formulario
      this.notificationService.warning('La descripción de la categoría es obligatoria.');
      return false;
    }

    return true;
  }

  getPaginationInfo() {
    const total = this.filteredCategories().length;
    return `Mostrando ${this.currentPage() === 1 ? '1' : (this.currentPage() - 1) * 10 + 1}-${Math.min(this.currentPage() * 10, total)} de ${total} categorías`;
  }

  // Format date for display
  formatDate(date: Date): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }
}
