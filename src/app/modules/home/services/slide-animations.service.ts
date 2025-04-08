import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SlideAnimationsService {

  animateSlideTransition(
    currentContainer: ElementRef,
    onComplete: () => void
  ): void {
    gsap.to(currentContainer.nativeElement, {
      opacity: 0,
      duration: 0.5,
      onComplete
    });
  }

  animateSlideContent(
    container: ElementRef,
    textContent: ElementRef,
    imageContent: ElementRef
  ): gsap.core.Timeline {
    gsap.set(container.nativeElement, { opacity: 0 });
    gsap.set(textContent.nativeElement, { opacity: 0, x: -50 });
    gsap.set(imageContent.nativeElement, { opacity: 0, x: 50 });

    const timeline = gsap.timeline();

    timeline
      .to(container.nativeElement, { opacity: 1, duration: 0.5 })
      .to(textContent.nativeElement, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3")
      .to(imageContent.nativeElement, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3");

    return timeline;
  }
}
