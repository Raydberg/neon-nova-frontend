import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, XIcon } from 'lucide-angular';

@Component({
  selector: 'product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "product-search.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent {
  @Input() placeholder = 'Buscar productos...';
  @Input() set query(value: string) {
    this.queryValue = value;
  }

  @Output() queryChange = new EventEmitter<string>();

  queryValue = '';

  // Iconos
  readonly SearchIcon = Search;
  readonly XIcon = XIcon;

  onQueryChange() {
    this.queryChange.emit(this.queryValue);
  }

  clearSearch() {
    this.queryValue = '';
    this.queryChange.emit('');
  }
}
