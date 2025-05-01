import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LucideAngularModule} from 'lucide-angular';
import {AuthService} from '@core/services/auth.service';

@Component({
  selector: 'profile-security',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="card bg-base-100 shadow-xl mt-8">
      <div class="card-body">
        <h3 class="card-title">Seguridad</h3>
        <p class="text-base-content/70 mb-4">
          Administra tu contraseña y la seguridad de tu cuenta
        </p>

        <div class="flex justify-end">
          <a routerLink="/perfil/cambiar-contrasena" class="btn btn-outline">
            <lucide-angular name="key" class="w-4 h-4 mr-2"></lucide-angular>
            Cambiar contraseña
          </a>
        </div>
      </div>
    </div>
  `
})
export class ProfileSecurityComponent {
  authService = inject(AuthService);
}
