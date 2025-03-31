import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavComponent } from '../../components/main-nav/main-nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, MainNavComponent, FooterComponent],
  template:`
  <section class="relative flex flex-col min-h-screen w-full">
      <main-nav />
      <main class="flex-1 w-full">
        <router-outlet />
      </main>
      <app-footer />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayoutComponent { }
