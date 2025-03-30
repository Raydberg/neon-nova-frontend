import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'admin-user-list',
  imports: [],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent { }
