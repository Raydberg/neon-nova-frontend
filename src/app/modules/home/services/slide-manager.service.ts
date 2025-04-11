import { Injectable } from '@angular/core';
import { interval, Subscription, Subject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SlideManagerService {
  private autoPlaySubscription?: Subscription;
  private isAutoPlaying = true;
  private slideChangeSubject = new Subject<number>();
  private _currentSlide = 0;
  slideChange$ = this.slideChangeSubject.asObservable();

  startAutoPlay(delay: number, totalSlides: number, currentSlide: number): void {
    this.stopAutoPlay();
    this.isAutoPlaying = true;

    // Almacenar el slide actual como propiedad del servicio
    this._currentSlide = currentSlide;

    this.autoPlaySubscription = interval(delay)
      .pipe(takeWhile(() => this.isAutoPlaying))
      .subscribe(() => {
        if (this.isAutoPlaying) {
          // Usar la propiedad interna para seguir la cuenta correctamente
          const nextIndex = this._currentSlide === totalSlides - 1 ? 0 : this._currentSlide + 1;
          this._currentSlide = nextIndex; // Actualizar el slide actual
          this.slideChangeSubject.next(nextIndex);
        }
      });
  }

  stopAutoPlay(): void {
    this.isAutoPlaying = false;
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
      this.autoPlaySubscription = undefined;
    }
  }

  pauseAutoPlay(duration: number): void {
    this.stopAutoPlay();
    setTimeout(() => this.isAutoPlaying = true, duration);
  }

  getNextSlideIndex(currentIndex: number, totalSlides: number): number {
    return currentIndex === totalSlides - 1 ? 0 : currentIndex + 1;
  }

  getPrevSlideIndex(currentIndex: number, totalSlides: number): number {
    return currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
  }
}
