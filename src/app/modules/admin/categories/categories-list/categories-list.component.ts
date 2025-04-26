import {ChangeDetectionStrategy, Component, inject, signal, OnInit, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';
import {debounceTime} from 'rxjs/operators';
import {rxResource} from '@angular/core/rxjs-interop';
import {AdminCategoryService} from '@app/core/services/admin/admin-category.service';
import {CategoryModel, Item} from '@app/core/models/category-model';

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

  // Form controls
  searchControl = new FormControl('');
  nameControl = new FormControl('');
  descriptionControl = new FormControl('');

  // Filtered categories based on search
  filteredCategories = signal<Item[]>([]);

  constructor() {

    effect(() => {
      const result = this.categoryResource.value();
      console.log(result)
      if (result?.items) {
        this.categoryItems.set(result.items || []);
        this.filteredCategories.set(result.items || []);
        this.currentPage.set(result.pageNumber);
        this.totalPages.set(result.totalPages);
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
  }

  // Pagination methods
  goToPreviousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      // TODO: Implement loading previous page from API
    }
  }

  goToNextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      // TODO: Implement loading next page from API
    }
  }

  openAddModal() {
    this.nameControl.setValue('');
    this.descriptionControl.setValue('');
    this.showAddModal.set(true);
  }

  openEditModal(category: Item) {
    this.categoryToEdit.set(category);
    this.nameControl.setValue(category.name);
    this.descriptionControl.setValue(category.description);
    this.showEditModal.set(true);
  }

  openDeleteModal(category: Item) {
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

    // Create new category object
    const newCategory: Item = {
      id: Math.max(0, ...this.categoryItems().map(c => c.id)) + 1,
      name,
      description,
      productCount: 0,
      createdAt: new Date()
    };

    // Update local state (you would typically call an API here)
    this.categoryItems.update(cats => [...cats, newCategory]);
    this.filteredCategories.set(this.categoryItems());
    this.closeModals();
  }

  saveCategory() {
    const category = this.categoryToEdit();
    if (!category) return;

    const name = this.nameControl.value;
    const description = this.descriptionControl.value;

    if (!name || !description) return;

    const updatedCategory: Item = {
      ...category,
      name,
      description
    };

    // Update local state (you would typically call an API here)
    this.categoryItems.update(cats =>
      cats.map(c => c.id === category.id ? updatedCategory : c)
    );
    this.filteredCategories.set(this.categoryItems());
    this.closeModals();
  }

  deleteCategory() {
    const category = this.categoryToDelete();
    if (!category) return;

    // Update local state (you would typically call an API here)
    this.categoryItems.update(cats =>
      cats.filter(c => c.id !== category.id)
    );
    this.filteredCategories.set(this.categoryItems());
    this.closeModals();
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
