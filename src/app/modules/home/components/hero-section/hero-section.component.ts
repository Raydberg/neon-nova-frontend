import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  signal,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {Subscription} from 'rxjs';
import {LucideAngularModule} from 'lucide-angular';
import {SlideAnimationsService} from '../../services/slide-animations.service';
import {SlideManagerService} from '../../services/slide-manager.service';

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
  styleUrls: ['./hero-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  // Services
  private animationsService = inject(SlideAnimationsService);
  private slideManager = inject(SlideManagerService);

  // Helpers
  private animationCleanup?: { destroy: () => void };
  private autoPlaySubscription?: Subscription;
  private readonly AUTO_PLAY_DELAY = 6000;
  private readonly PAUSE_DURATION = 5000;
  currentSlide = signal(0);

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

  @ViewChildren('slideContainer') slideContainers!: QueryList<ElementRef>;
  @ViewChildren('textContent') textContents!: QueryList<ElementRef>;
  @ViewChildren('imageContent') imageContents!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.precacheImages();
    this.setupAutoPlay();
  }

  private precacheImages(): void {
    this.heroSlides.forEach(slide => {
      const img = new Image();
      img.src = slide.image;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.animateCurrentSlide(), 150);
  }

  ngOnDestroy(): void {
    if (this.autoPlaySubscription) {
      this.autoPlaySubscription.unsubscribe();
    }
    if (this.animationCleanup) {
      this.animationCleanup.destroy();
    }
  }


  goToSlide(index: number): void {
    if (index === this.currentSlide()) return;
    this.changeSlide(index);

    this.slideManager.pauseAutoPlay(this.PAUSE_DURATION);
    this.slideManager.startAutoPlay(
      this.AUTO_PLAY_DELAY,
      this.heroSlides.length,
      index
    );
  }

  private changeSlide(newIndex: number): void {

    if (!this.slideContainers || this.slideContainers.length === 0) {
      this.currentSlide.set(newIndex);
      return;
    }

    const containers = this.slideContainers.toArray();
    const currentContainer = containers[this.currentSlide()]?.nativeElement;

    const nextContainer = containers[newIndex]?.nativeElement;

    if (nextContainer) {
      nextContainer.classList.remove('hidden');
      nextContainer.style.opacity = '0';
    }

    if (currentContainer) {
      this.animationsService.animateSlideTransition(
        {nativeElement: currentContainer},
        () => {
          currentContainer.classList.add('hidden');

          this.currentSlide.set(newIndex);

          this.animateCurrentSlide();
        }
      );
    } else {
      this.currentSlide.set(newIndex);
      this.animateCurrentSlide();
    }
  }

  private animateCurrentSlide(): void {
    if (this.animationCleanup) {
      this.animationCleanup.destroy();
    }

    if (!this.slideContainers || !this.textContents || !this.imageContents ||
      this.slideContainers.length === 0) {
      return;
    }

    const containers = this.slideContainers.toArray();
    const textContents = this.textContents.toArray();
    const imageContents = this.imageContents.toArray();

    const currentIndex = this.currentSlide();
    const container = containers[currentIndex];
    const textContent = textContents[currentIndex];
    const imageContent = imageContents[currentIndex];

    if (!container || !textContent || !imageContent) return;

    this.animationCleanup = this.animationsService.animateSlideContent(container, textContent, imageContent);
  }

  private setupAutoPlay(): void {
    this.autoPlaySubscription = this.slideManager.slideChange$.subscribe(newIndex => {
      this.changeSlide(newIndex);
    });

    this.slideManager.startAutoPlay(
      this.AUTO_PLAY_DELAY,
      this.heroSlides.length,
      this.currentSlide()
    );
  }
}
