import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'product-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: "product-search.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSearchComponent implements OnInit {
  @Input() placeholder = 'Buscar productos...';
  @Input() set query(value: string) {
    console.log('Search component received query:', value);
    this.queryValue = value || '';
  }

  @Output() queryChange = new EventEmitter<string>();

  queryValue = '';

  ngOnInit() {
    console.log('ProductSearchComponent initialized with query:', this.queryValue);
  }

  onQueryChange() {
    console.log('Query changed in search component:', this.queryValue);
    this.queryChange.emit(this.queryValue);
  }

  clearSearch() {
    console.log('Search cleared');
    this.queryValue = '';
    this.queryChange.emit('');
  }
}
