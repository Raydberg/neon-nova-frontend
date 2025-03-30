import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'auth-login',
  imports: [],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent { }
