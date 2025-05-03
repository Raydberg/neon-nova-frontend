import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from '@app/core/services/category.service';
import { CommonModule } from '@angular/common';

interface Category {
  id: number;
  name: string;
  class?: string;
}

@Component({
  selector: 'product-category-filter',
  imports: [CommonModule],
  templateUrl: './category-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterComponent {
  private categoryService = inject(CategoryService);

  loadCategories = rxResource({
    loader: () => this.categoryService.getCategories(),
    defaultValue: []
  });

  private categoryStyles: Record<number, string> = {
    0: 'btn-primary',
    1: 'btn-secondary',
    2: 'btn-accent',
    3: 'btn-info',
    4: 'btn-success',
    5: 'btn-neutral',
    6: 'btn-error',
    7: 'btn-warning',
    8: 'btn-info'
  };

  showFilters = input<boolean>(false);
  selectedCategory = input<number | null>(null);
  categoryChange = output<number | null>();

  categories = computed(() => {
    const apiCategories = this.loadCategories.value() || [];
    const styledCategories = apiCategories.map((category: Category) => ({
      ...category,
      class: this.categoryStyles[category.id] || 'btn-neutral'
    }));

    return [
      { id: 0, name: 'Todas', class: 'btn-primary' },
      ...styledCategories
    ];
  });

  getCategoryClass(categoryId: number): string {
    const isSelected = (categoryId === 0 && this.selectedCategory() === null) ||
      (categoryId !== 0 && this.selectedCategory() === categoryId);

    if (isSelected) {
      const category = this.categories().find(c => c.id === categoryId);
      return category?.class || 'btn-primary';
    }

    return 'btn-outline';
  }
}
