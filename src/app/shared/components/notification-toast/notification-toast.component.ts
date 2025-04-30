import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '@core/services/notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'notification-toast',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }), // Cambiado a entrar desde la derecha
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(-100%)' })), // Cambiado a salir hacia la izquierda
      ]),
    ]),
  ],
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  notifications = this.notificationService.activeNotifications;

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      default: return 'bell';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'success': return 'alert-success';
      case 'error': return 'alert-error';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-info';
    }
  }

  close(id: number): void {
    this.notificationService.dismiss(id);
  }
}
