import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';


import { ArrowRight, ChevronLeft, ChevronRight, LucideAngularModule, ShoppingCart } from 'lucide-angular';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton: {
    text: string;
    link: string;
  };
  color: string;
}

@Component({
  selector: 'hero-section',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './hero-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  
  readonly ArrowRight = ArrowRight;
  readonly ShoppingCart = ShoppingCart;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: "Tecnología de vanguardia",
      subtitle: "Colección 2024",
      description: "Descubre los dispositivos más innovadores con diseño premium y rendimiento excepcional.",
      image: "https://images.unsplash.com/photo-1661961110671-77b71b929d52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      primaryButton: {
        text: "Comprar ahora",
        link: "/productos",
      },
      secondaryButton: {
        text: "Ver colección",
        link: "/productos?coleccion=nueva",
      },
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: 2,
      title: "Experiencia gaming",
      subtitle: "Edición limitada",
      description: "Equípate con lo mejor en tecnología gaming para una experiencia inmersiva sin precedentes.",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1057&q=80",
      primaryButton: {
        text: "Explorar",
        link: "/productos?categoria=gaming",
      },
      secondaryButton: {
        text: "Ver ofertas",
        link: "/productos?oferta=gaming",
      },
      color: "from-purple-600 to-pink-700",
    },
    {
      id: 3,
      title: "Productividad sin límites",
      subtitle: "Trabaja desde cualquier lugar",
      description: "Dispositivos diseñados para potenciar tu productividad, estés donde estés.",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
      primaryButton: {
        text: "Descubrir",
        link: "/productos?categoria=productividad",
      },
      secondaryButton: {
        text: "Ver laptops",
        link: "/productos?categoria=1",
      },
      color: "from-green-600 to-teal-700",
    },
    {
      id: 4,
      title: "Productividad sin límites",
      subtitle: "Trabaja desde cualquier lugar",
      description: "Dispositivos diseñados para potenciar tu productividad, estés donde estés.",
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80",
      primaryButton: {
        text: "Descubrir",
        link: "/productos?categoria=productividad",
      },
      secondaryButton: {
        text: "Ver laptops",
        link: "/productos?categoria=1",
      },
      color: "from-green-600 to-teal-700",
    },
    {
      id: 5,
      title: "Tecnología de vanguardia",
      subtitle: "Colección 2024",
      description: "Descubre los dispositivos más innovadores con diseño premium y rendimiento excepcional.",
      image: "https://images.unsplash.com/photo-1661961110671-77b71b929d52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      primaryButton: {
        text: "Comprar ahora",
        link: "/productos",
      },
      secondaryButton: {
        text: "Ver colección",
        link: "/productos?coleccion=nueva",
      },
      color: "from-blue-600 to-indigo-700",
    },
  ];

  currentSlide = signal(0);
  isAutoPlaying = signal(true);

  @ViewChildren('slideContainer') slideContainers!: QueryList<ElementRef>;
  @ViewChildren('textContent') textContents!: QueryList<ElementRef>;
  @ViewChildren('imageContent') imageContents!: QueryList<ElementRef>;


  private autoPlaySubscription?: Subscription;
  private timeline?: gsap.core.Timeline;

  ngOnInit(): void {
    this.setupAutoPlay();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.animateCurrentSlide();
    }, 150);
  }

  ngOnDestroy(): void {
    this.autoPlaySubscription?.unsubscribe();
    if (this.timeline) {
      this.timeline.kill();
    }
  }

  nextSlide(): void {
    const nextIndex = this.currentSlide() === this.heroSlides.length - 1 ? 0 : this.currentSlide() + 1;
    this.changeSlide(nextIndex);
  }

  prevSlide(): void {
    const prevIndex = this.currentSlide() === 0 ? this.heroSlides.length - 1 : this.currentSlide() - 1;
    this.changeSlide(prevIndex);
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide()) return;
    this.changeSlide(index);
    this.pauseAutoPlay();
    setTimeout(() => this.resumeAutoPlay(), 5000);
  }

  private changeSlide(newIndex: number): void {

    if (!this.slideContainers || this.slideContainers.length === 0) {
      this.currentSlide.set(newIndex);
      return;
    }

    const containers = this.slideContainers.toArray();
    const currentContainer = containers[this.currentSlide()]?.nativeElement;

    if (currentContainer) {
      gsap.to(currentContainer, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          this.currentSlide.set(newIndex);
          setTimeout(() => {
            this.animateCurrentSlide();
          }, 50);
        }
      });
    } else {
      this.currentSlide.set(newIndex);
      this.animateCurrentSlide();
    }
  }

  private animateCurrentSlide(): void {
    if (this.timeline) {
      this.timeline.kill();
    }

    if (!this.slideContainers || !this.textContents || !this.imageContents ||
      this.slideContainers.length === 0) {
      return;
    }

    const containers = this.slideContainers.toArray();
    const textContents = this.textContents.toArray();
    const imageContents = this.imageContents.toArray();

    const currentIndex = this.currentSlide();
    const container = containers[currentIndex]?.nativeElement;
    const textContent = textContents[currentIndex]?.nativeElement;
    const imageContent = imageContents[currentIndex]?.nativeElement;

    if (!container || !textContent || !imageContent) return;

    gsap.set(container, { opacity: 0 });
    gsap.set(textContent, { opacity: 0, x: -50 });
    gsap.set(imageContent, { opacity: 0, x: 50 });


    this.timeline = gsap.timeline();

    this.timeline
      .to(container, { opacity: 1, duration: 0.5 })
      .to(textContent, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3")
      .to(imageContent, { opacity: 1, x: 0, duration: 0.5 }, "-=0.3");
  }

  private setupAutoPlay(): void {
    this.autoPlaySubscription = interval(6000)
      .pipe(takeWhile(() => this.isAutoPlaying()))
      .subscribe(() => {
        if (this.isAutoPlaying()) {
          this.nextSlide();
        }
      });
  }

  private pauseAutoPlay(): void {
    this.isAutoPlaying.set(false);
    this.autoPlaySubscription?.unsubscribe();
  }

  private resumeAutoPlay(): void {
    this.isAutoPlaying.set(true);
    this.setupAutoPlay();
  }
}
