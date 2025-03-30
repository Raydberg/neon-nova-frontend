import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'order-list',
  imports: [],
  templateUrl: './order-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderListComponent { }
