import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSectionComponent } from "./components/hero-section/hero-section.component";
import { StatsCounterComponent } from "./components/stats-counter/stats-counter.component";
import { FeaturedCategoriesComponent } from "./components/featured-categories/featured-categories.component";
import { FeaturedCollectionComponent } from "./components/featured-collection/featured-collection.component";
import { FeaturedProductsComponent } from "./components/featured-products/featured-products.component";
import { WhyChooseUsComponent } from "./components/why-choose-us/why-choose-us.component";
import { PromoBannerComponent } from "./components/promo-banner/promo-banner.component";
import { TrendingProductsComponent } from "./components/trending-products/trending-products.component";
import { TestimonialsComponent } from "./components/testimonials/testimonials.component";
import { FeaturedBrandsComponent } from "./components/featured-brands/featured-brands.component";
import { NewsLetterComponent } from "./components/news-letter/news-letter.component";

@Component({
  selector: 'app-home',
  imports: [
    HeroSectionComponent,
    StatsCounterComponent,
    FeaturedCategoriesComponent,
    FeaturedCollectionComponent,
    FeaturedProductsComponent,
    WhyChooseUsComponent,
    PromoBannerComponent,
    TrendingProductsComponent,
    TestimonialsComponent,
    FeaturedBrandsComponent,
    NewsLetterComponent
  ],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {}
