import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'product-filter-bar',
  imports: [LucideAngularModule, CommonModule,FormsModule],
  templateUrl: './filter-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBarComponent {
  searchQuery = input<string>("")
  currentSort = input<string>("relevancia")
  search = output<string>()
  sort = output<string>()
  toggleFilters = output<void>()

  sortOptions = signal([
    { value: "relevancia", label: "Relevancia" },
    { value: "precio-asc", label: "Precio:Menor a Mayor" },
    { value: "precio-desc", label: "Precio: Mayor a Menor" },
    { value: "puntuacion", label: "Precio: Mejor puntuados" },
  ])
  isOptionSelected = computed(() => {
    return (optionValue: string) => optionValue === this.currentSort();
  })

  searchInputValue = signal(this.searchQuery())
  constructor() {
    effect(() => {
      this.searchInputValue.set(this.searchQuery())
    })
  }
  onSearch(value: string): void {
    this.searchInputValue.set(value)
    this.search.emit(value)
  }
  onSort(value: string): void {
    this.sort.emit(value)
  }
}
