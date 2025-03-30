import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSectionComponent } from "../../shared/components/hero-section/hero-section.component";

@Component({
  selector: 'app-home',
  imports: [HeroSectionComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
