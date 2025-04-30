import {Injectable, signal} from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private counter = 0;
  private readonly notifications = signal<Notification[]>([]);

  readonly activeNotifications = this.notifications.asReadonly();

  constructor() {
  }


  show(message: string, type: NotificationType = 'info', duration: number = 3000): number {
    const id = this.getNextId();
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      progress: 100
    };

    this.notifications.update(notifications => [...notifications, notification]);

    this.setupAutoDismiss(id, duration);

    return id;
  }

  success(message: string, duration: number = 3000): number {
    return this.show(message, 'success', duration);
  }


  error(message: string, duration: number = 4000): number {
    return this.show(message, 'error', duration);
  }


  warning(message: string, duration: number = 3500): number {
    return this.show(message, 'warning', duration);
  }


  info(message: string, duration: number = 3000): number {
    return this.show(message, 'info', duration);
  }


  dismiss(id: number): void {
    this.notifications.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }


  clearAll(): void {
    this.notifications.set([]);
  }


  private setupAutoDismiss(id: number, duration: number): void {
    const steps = duration / 30;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = 100 - Math.round((step / steps) * 100);

      this.notifications.update(notifications =>
        notifications.map(notification =>
          notification.id === id
            ? {...notification, progress}
            : notification
        )
      );

      if (step >= steps) {
        clearInterval(interval);
        this.dismiss(id);
      }
    }, 30);
  }


  private getNextId(): number {
    return ++this.counter;
  }
}
