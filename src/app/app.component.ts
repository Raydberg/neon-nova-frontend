import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@core/services/theme.service';
import {NotificationToastComponent} from '@shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationToastComponent],
  template: `<router-outlet /> <notification-toast/> `,
})
export class AppComponent {
  private themeService = inject(ThemeService)
}
