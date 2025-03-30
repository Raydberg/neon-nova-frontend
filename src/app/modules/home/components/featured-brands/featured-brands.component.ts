import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface Brand {
  id: number;
  name: string;
  logo: string;
  color?: string;
}

@Component({
  selector: 'featured-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-brands.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedBrandsComponent implements OnInit, OnDestroy {
  @ViewChild('brandsContainer', { static: false }) brandsContainer!: ElementRef;

  // Estado reactivo con señales
  isLoaded = signal(false);
  isMobile = signal(window.innerWidth < 768);

  // Datos de marcas con rutas a los archivos SVG y colores de marca
  brands = signal<Brand[]>([
    { id: 1, name: "Apple", logo: "assets/apple.svg", color: "#555555" },
    { id: 2, name: "Samsung", logo: "assets/samsung.svg", color: "#1428A0" },
    { id: 3, name: "Sony", logo: "assets/sony.svg", color: "#0068bf" },
    { id: 4, name: "Microsoft", logo: "assets/microsoft.svg", color: "#00a4ef" },
    { id: 5, name: "LG", logo: "assets/Lg.svg", color: "#a50034" },
    { id: 6, name: "Dell", logo: "assets/dell.svg", color: "#007db8" },
  ]);

  ngOnInit() {
    // Detectar cambios de tamaño de pantalla
    window.addEventListener('resize', this.handleResize.bind(this));

    // Configurar animaciones después de que el DOM esté listo
    setTimeout(() => {
      this.setupAnimations();
      this.isLoaded.set(true);
    }, 100);
  }

  // Limpiar listeners al destruir el componente
  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  private handleResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  private setupAnimations() {
    if (!this.brandsContainer) return;

    const brandElements = this.brandsContainer.nativeElement.querySelectorAll('.brand-item');
    const brandImages = this.brandsContainer.nativeElement.querySelectorAll('.brand-image');

    // Animación de entrada con GSAP y ScrollTrigger
    gsap.fromTo(brandElements,
      {
        opacity: 0,
        y: 30,
        scale: 0.8
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.1,
        duration: 0.7,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: this.brandsContainer.nativeElement,
          start: "top 85%",
          once: true
        }
      }
    );

    // Animación tipo olas suaves para los logos
    brandElements.forEach((brand: Element, index: number) => {
      // Movimiento vertical ondulante (eje Y)
      gsap.to(brand, {
        y: "+=8",
        duration: 2.5 + (index * 0.2 % 0.7), // Duración ligeramente diferente para cada elemento
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut", // Curva de suavizado tipo sinusoidal para movimiento de olas
        delay: index * 0.3 % 1.5 // Retraso escalonado para crear efecto de olas
      });

      // Movimiento horizontal sutil (eje X)
      gsap.to(brand, {
        x: "+=5",
        duration: 3 + (index * 0.15 % 0.9), // Ciclo distinto al vertical para mayor naturalidad
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: (index * 0.2 + 0.5) % 1.2 // Desfase con el movimiento vertical
      });

      // Rotación muy leve para efecto de flotación
      gsap.to(brand, {
        rotation: (index % 2 === 0) ? "+=1.5" : "-=1.5", // Alternar dirección de rotación
        duration: 4 + (index * 0.25 % 1.2),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: (index * 0.4 + 0.7) % 1.8
      });
    });

    // Animación de fondo tipo olas (opcional)
    const container = this.brandsContainer.nativeElement;
    gsap.to(container, {
      backgroundPosition: '100% 100%',
      duration: 15,
      repeat: -1,
      ease: "sine.inOut",
    });

    // Crear un efecto de resplandor sutil en hover
    gsap.utils.toArray('.brand-item').forEach((brand: any) => {
      const brandImage = brand.querySelector('.brand-image');
      const brandName = brand.querySelector('.brand-name');
      const brandCard = brand.querySelector('.brand-card');

      brand.addEventListener('mouseenter', () => {
        // Pausar la animación de olas al hacer hover
        gsap.killTweensOf(brand);

        gsap.to(brand, {
          y: 0,
          x: 0,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out"
        });

        gsap.to(brandImage, {
          filter: 'brightness(1.1) grayscale(0)',
          scale: 1.2,
          duration: 0.3
        });

        gsap.to(brandName, {
          opacity: 1,
          y: 0,
          duration: 0.3
        });

        gsap.to(brandCard, {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          duration: 0.3
        });
      });

      brand.addEventListener('mouseleave', () => {
        gsap.to(brandImage, {
          filter: 'brightness(1) grayscale(0.7)',
          scale: 1,
          duration: 0.3
        });

        gsap.to(brandName, {
          opacity: 0.7,
          y: 5,
          duration: 0.3
        });

        gsap.to(brandCard, {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          duration: 0.3
        });

        // Reiniciar la animación de olas después de salir del hover
        const index = Array.from(brandElements).indexOf(brand);

        // Movimiento vertical ondulante (eje Y)
        gsap.to(brand, {
          y: "+=8",
          duration: 2.5 + (index * 0.2 % 0.7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.3 % 1.5
        });

        // Movimiento horizontal sutil (eje X)
        gsap.to(brand, {
          x: "+=5",
          duration: 3 + (index * 0.15 % 0.9),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: (index * 0.2 + 0.5) % 1.2
        });

        // Rotación muy leve
        gsap.to(brand, {
          rotation: (index % 2 === 0) ? "+=1.5" : "-=1.5",
          duration: 4 + (index * 0.25 % 1.2),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: (index * 0.4 + 0.7) % 1.8
        });
      });
    });
  }
}
