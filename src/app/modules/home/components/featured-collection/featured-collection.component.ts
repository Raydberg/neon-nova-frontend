import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './featured-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedCollectionComponent implements OnInit {
  @ViewChild('collectionsContainer', { static: false }) collectionsContainer!: ElementRef;
  @ViewChild('gamingCollection', { static: false }) gamingCollection!: ElementRef;
  @ViewChild('smartHomeCollection', { static: false }) smartHomeCollection!: ElementRef;

  isVisible = signal(false);

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
      this.setupScrollAnimation();
    }, 100);
  }

  private setupScrollAnimation() {
    ScrollTrigger.create({
      trigger: this.collectionsContainer?.nativeElement,
      start: "top 80%",
      onEnter: () => {
        this.isVisible.set(true);
        this.animateCollections();
      },
      once: true
    });
  }

  private animateCollections() {
    if (!this.isVisible()) return;

    if (this.gamingCollection) {
      gsap.fromTo(this.gamingCollection.nativeElement,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out"
        }
      );
    }

    if (this.smartHomeCollection) {
      gsap.fromTo(this.smartHomeCollection.nativeElement,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.15
        }
      );
    }
  }
}
