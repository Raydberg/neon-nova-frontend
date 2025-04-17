import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime } from 'rxjs/operators';

interface Category {
  id: number;
  name: string;
  description: string;
  products: number;
  createdAt: string;
}

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
export class CategoriesListComponent {
  categories = signal<Category[]>([
    {
      id: 1,
      name: "Laptops",
      description: "Ordenadores portátiles y accesorios",
      products: 15,
      createdAt: "2023-05-10"
    },
    {
      id: 2,
      name: "Smartphones",
      description: "Teléfonos móviles inteligentes y accesorios",
      products: 23,
      createdAt: "2023-05-12"
    },
    {
      id: 3,
      name: "Audio",
      description: "Auriculares, altavoces y equipos de sonido",
      products: 18,
      createdAt: "2023-05-15"
    },
    {
      id: 4,
      name: "Wearables",
      description: "Smartwatches y dispositivos vestibles",
      products: 10,
      createdAt: "2023-06-01"
    },
    {
      id: 5,
      name: "Cámaras",
      description: "Cámaras fotográficas y de video",
      products: 8,
      createdAt: "2023-06-10"
    }
  ]);

  currentPage = signal(1);
  totalPages = signal(1);
  showAddModal = signal(false);
  showEditModal = signal(false);
  showDeleteModal = signal(false);
  categoryToEdit = signal<Category | null>(null);
  categoryToDelete = signal<Category | null>(null);

  // Form controls
  searchControl = new FormControl('');
  nameControl = new FormControl('');
  descriptionControl = new FormControl('');

  // Filtered categories based on search
  filteredCategories = signal<Category[]>(this.categories());

  ngOnInit() {
    // Suscribirse al cambio en el campo de búsqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.filterCategories(value || '');
    });
  }

  filterCategories(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredCategories.set(this.categories());
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = this.categories().filter(cat =>
      cat.name.toLowerCase().includes(lowerSearch) ||
      cat.description.toLowerCase().includes(lowerSearch)
    );

    this.filteredCategories.set(filtered);
  }

  // Métodos de paginación
  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  openAddModal() {
    this.nameControl.setValue('');
    this.descriptionControl.setValue('');
    this.showAddModal.set(true);
  }

  openEditModal(category: Category) {
    this.categoryToEdit.set(category);
    this.nameControl.setValue(category.name);
    this.descriptionControl.setValue(category.description);
    this.showEditModal.set(true);
  }

  openDeleteModal(category: Category) {
    this.categoryToDelete.set(category);
    this.showDeleteModal.set(true);
  }

  closeModals() {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.showDeleteModal.set(false);
    this.categoryToEdit.set(null);
    this.categoryToDelete.set(null);
  }

  addCategory() {
    const name = this.nameControl.value;
    const description = this.descriptionControl.value;

    if (!name || !description) return;

    const newCategory: Category = {
      id: Math.max(...this.categories().map(c => c.id)) + 1,
      name,
      description,
      products: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.categories.update(cats => [...cats, newCategory]);
    this.filteredCategories.set(this.categories());
    this.closeModals();
  }

  saveCategory() {
    const category = this.categoryToEdit();
    if (!category) return;

    const name = this.nameControl.value;
    const description = this.descriptionControl.value;

    if (!name || !description) return;

    const updatedCategory = {
      ...category,
      name,
      description
    };

    this.categories.update(cats =>
      cats.map(c => c.id === category.id ? updatedCategory : c)
    );
    this.filteredCategories.set(this.categories());
    this.closeModals();
  }

  deleteCategory() {
    const category = this.categoryToDelete();
    if (!category) return;

    this.categories.update(cats =>
      cats.filter(c => c.id !== category.id)
    );
    this.filteredCategories.set(this.categories());
    this.closeModals();
  }

  getPaginationInfo() {
    const total = this.filteredCategories().length;
    return `Mostrando 1-${total} de ${total} categorías`;
  }
}
