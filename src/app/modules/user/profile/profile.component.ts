import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'user-profile',
  imports: [],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent { }
