import { Directive, Input, OnInit, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import {AuthService} from '@core/services/auth.service';

@Directive({
  selector: '[appAuthCheck]',
  standalone: true
})
export class AuthCheckDirective implements OnInit {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private hasView = false;

  // Acepta 'any', 'auth', 'admin', 'user'
  @Input() set appAuthCheck(requiredRole: 'any' | 'auth' | 'admin' | 'user') {
    // 'any' - cualquier visitante
    // 'auth' - cualquier usuario autenticado
    // 'admin' - solo administradores
    // 'user' - solo usuarios no-admin autenticados

    const isLoggedIn = this.authService.isLoggedIn();
    const isAdmin = this.authService.isAdmin();

    let hasAccess = false;

    switch(requiredRole) {
      case 'any':
        hasAccess = true;
        break;
      case 'auth':
        hasAccess = isLoggedIn;
        break;
      case 'admin':
        hasAccess = isLoggedIn && isAdmin;
        break;
      case 'user':
        hasAccess = isLoggedIn && !isAdmin;
        break;
    }

    if (hasAccess && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasAccess && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnInit(): void { }
}
