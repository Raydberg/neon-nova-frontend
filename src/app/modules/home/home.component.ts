import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSectionComponent } from "./components/hero-section/hero-section.component";
import { StatsCounterComponent } from "./components/stats-counter/stats-counter.component";
import { FeaturedCategoriesComponent } from "./components/featured-categories/featured-categories.component";
import { FeaturedCollectionComponent } from "./components/featured-collection/featured-collection.component";

@Component({
  selector: 'app-home',
  imports: [HeroSectionComponent, StatsCounterComponent, FeaturedCategoriesComponent, FeaturedCollectionComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
