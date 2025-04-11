import { Injectable, ElementRef } from '@angular/core';

interface AnimationCleanup {
  destroy: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class SlideAnimationsService {
  /**
   * Anima la transición de salida de un slide
   */
  animateSlideTransition(
    currentContainer: ElementRef,
    onComplete: () => void
  ): void {
    this.resetElement(currentContainer.nativeElement);

    currentContainer.nativeElement.classList.add('slide-fade-out');

    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === 'fadeOut') {
        currentContainer.nativeElement.removeEventListener('animationend', handleAnimationEnd);
        onComplete();
      }
    };

    currentContainer.nativeElement.addEventListener('animationend', handleAnimationEnd);

    const failsafeTimer = setTimeout(() => {
      currentContainer.nativeElement.removeEventListener('animationend', handleAnimationEnd);
      onComplete();
    }, 600);
  }

  /**
   * Anima la aparición de contenido de un nuevo slide
   */
  animateSlideContent(
    container: ElementRef,
    textContent: ElementRef,
    imageContent: ElementRef
  ): AnimationCleanup {
    this.resetElement(container.nativeElement);
    this.resetElement(textContent.nativeElement);
    this.resetElement(imageContent.nativeElement);

    container.nativeElement.classList.add('slide-fade-in');

    setTimeout(() => {
      textContent.nativeElement.classList.add('slide-from-left');

      setTimeout(() => {
        imageContent.nativeElement.classList.add('slide-from-right');
      }, 200);
    }, 200);

    // Añadir failsafe para asegurar que los elementos sean visibles
    const failsafe = setTimeout(() => {
      if (container.nativeElement.style.opacity !== '1') {
        container.nativeElement.style.opacity = '1';
      }
      if (textContent.nativeElement.style.opacity !== '1') {
        textContent.nativeElement.style.opacity = '1';
        textContent.nativeElement.style.transform = 'translateX(0)';
      }
      if (imageContent.nativeElement.style.opacity !== '1') {
        imageContent.nativeElement.style.opacity = '1';
        imageContent.nativeElement.style.transform = 'translateX(0)';
      }
    }, 1000);

    return {
      destroy: () => {
        container.nativeElement.classList.remove('slide-fade-in');
        textContent.nativeElement.classList.remove('slide-from-left');
        imageContent.nativeElement.classList.remove('slide-from-right');
        clearTimeout(failsafe);
      }
    };
  }

  /**
   * Resetea un elemento para prepararlo para nuevas animaciones
   */
  private resetElement(element: HTMLElement): void {
    if (!element) return;

    element.classList.remove('slide-fade-out', 'slide-fade-in', 'slide-from-left', 'slide-from-right');

    element.style.animation = 'none';
    element.offsetHeight;
    element.style.animation = '';
  }
}
