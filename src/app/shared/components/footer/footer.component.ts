import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule
  ],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  // Iconos para usar en el template
  readonly FacebookIcon = FacebookIcon;
  readonly TwitterIcon = TwitterIcon;
  readonly InstagramIcon = InstagramIcon;
}
