import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  link: string;
  image: string;
  gradient: string;
  textColor: string;
}

@Component({
  selector: 'featured-collection',
  imports: [CommonModule, RouterModule],
  templateUrl: './featured-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedCollectionComponent implements OnInit, OnDestroy {
  @ViewChild('collectionsContainer', { static: false }) collectionsContainer!: ElementRef;
  @ViewChild('gamingCollection', { static: false }) gamingCollection!: ElementRef;
  @ViewChild('smartHomeCollection', { static: false }) smartHomeCollection!: ElementRef;

  isVisible = signal(false);
  private observer: IntersectionObserver | null = null;

  collections: Collection[] = [
    {
      id: 1,
      title: "Gaming Elite",
      subtitle: "Nueva colección",
      description: "Equípate con lo mejor en tecnología gaming para una experiencia inmersiva",
      buttonText: "Explorar colección",
      link: "/colecciones/gaming",
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1057&q=80",
      gradient: "bg-gradient-to-r from-blue-600 to-indigo-700",
      textColor: "text-blue-700"
    },
    {
      id: 2,
      title: "Smart Home",
      subtitle: "Destacado",
      description: "Transforma tu hogar con los dispositivos inteligentes más avanzados",
      buttonText: "Descubrir más",
      link: "/colecciones/smart-home",
      image: "https://images.unsplash.com/photo-1558002038-2f2e8417a9c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      gradient: "bg-gradient-to-r from-purple-600 to-pink-700",
      textColor: "text-purple-700"
    }
  ];

  ngOnInit() {
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible.set(true);
          this.observer?.disconnect();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20% 0px'
    });

    // Start observing the collections container
    setTimeout(() => {
      if (this.collectionsContainer?.nativeElement) {
        this.observer?.observe(this.collectionsContainer.nativeElement);
      }
    }, 0);
  }
}
