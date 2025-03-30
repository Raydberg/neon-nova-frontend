import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'admin-categories-list',
  imports: [],
  templateUrl: './categories-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesListComponent { }
