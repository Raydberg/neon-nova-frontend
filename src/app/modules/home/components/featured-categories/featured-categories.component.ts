import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ProductService } from '@app/core/services/product.service';

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'featured-categories',
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './featured-categories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedCategoriesComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  @ViewChild('categoriesGrid', { static: false }) categoriesGrid!: ElementRef;

  private iconMapping: Record<string, string> = {
    'Laptops': 'laptop',
    'Smartphones': 'smartphone',
    'Audio': 'headphones',
    'Wearables': 'watch',
    'Cámaras': 'camera',
    'Televisores': 'tv',
    'Gaming': 'gamepad',
    'Impresoras': 'printer'
  };

  private colorMapping: Record<string, string> = {
    'Laptops': 'bg-blue-50 text-blue-600',
    'Smartphones': 'bg-purple-50 text-purple-600',
    'Audio': 'bg-green-50 text-green-600',
    'Wearables': 'bg-yellow-50 text-yellow-600',
    'Cámaras': 'bg-red-50 text-red-600',
    'Televisores': 'bg-indigo-50 text-indigo-600',
    'Gaming': 'bg-pink-50 text-pink-600',
    'Impresoras': 'bg-teal-50 text-teal-600'
  };

  private predefinedCategories: Category[] = [
    { id: 1, name: "Laptops", icon: 'laptop', color: "bg-blue-50 text-blue-600" },
    { id: 2, name: "Smartphones", icon: 'smartphone', color: "bg-purple-50 text-purple-600" },
    { id: 3, name: "Audio", icon: 'headphones', color: "bg-green-50 text-green-600" },
    { id: 4, name: "Wearables", icon: 'watch', color: "bg-yellow-50 text-yellow-600" },
    { id: 5, name: "Cámaras", icon: 'camera', color: "bg-red-50 text-red-600" },
    { id: 6, name: "Televisores", icon: 'tv', color: "bg-indigo-50 text-indigo-600" },
    { id: 7, name: "Gaming", icon: 'gamepad', color: "bg-pink-50 text-pink-600" },
    { id: 8, name: "Impresoras", icon: 'printer', color: "bg-teal-50 text-teal-600" }
  ];
  categories = computed(() => {
    return this.predefinedCategories;
  });

  isVisible = signal(false);
  private observer: IntersectionObserver | null = null;

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
    if (!this.categoriesGrid) return;

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

    setTimeout(() => {
      if (this.categoriesGrid?.nativeElement) {
        this.observer?.observe(this.categoriesGrid.nativeElement);
      }
    }, 0);
  }
}
