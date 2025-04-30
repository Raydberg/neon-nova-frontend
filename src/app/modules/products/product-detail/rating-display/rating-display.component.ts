import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'rating-display',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center mb-4">
      <div class="flex mr-2">
        @for (star of ratingToArray(); track $index) {
          @if (star === 1) {
            <lucide-angular
              name="star"
              class="w-5 h-5 fill-warning text-warning"
            ></lucide-angular>
          } @else if (star === 0.5) {
            <div class="relative w-5 h-5">
              <lucide-angular
                name="star"
                class="absolute w-5 h-5 text-base-300"
              ></lucide-angular>
              <div class="absolute overflow-hidden w-2.5 h-5">
                <lucide-angular
                  name="star"
                  class="w-5 h-5 fill-warning text-warning"
                ></lucide-angular>
              </div>
            </div>
          } @else {
            <lucide-angular
              name="star"
              class="w-5 h-5 text-base-300"
            ></lucide-angular>
          }
        }
      </div>
      <span class="text-sm text-base-content/70">
        {{ rating() }} ({{ totalReviews() }} reseñas)
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingDisplayComponent {
  rating = input.required<number>();
  totalReviews = input(0);

  ratingToArray(): number[] {
    const result: number[] = [];
    const fullStars = Math.floor(this.rating());
    const hasHalfStar = this.rating() % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      result.push(1);
    }

    if (hasHalfStar) {
      result.push(0.5);
    }

    while (result.length < 5) {
      result.push(0);
    }

    return result;
  }
}
