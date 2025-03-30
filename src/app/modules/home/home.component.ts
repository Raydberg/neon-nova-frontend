import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSectionComponent } from "./components/hero-section/hero-section.component";
import { StatsCounterComponent } from "./components/stats-counter/stats-counter.component";

@Component({
  selector: 'app-home',
  imports: [HeroSectionComponent, StatsCounterComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
