import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LaptopIcon, SmartphoneIcon, HeadphonesIcon, WatchIcon, CameraIcon, TvIcon, GamepadIcon, PrinterIcon } from 'lucide-angular';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Category {
  id: number;
  name: string;
  icon: any;
  href: string;
  color: string;
}

@Component({
  selector: 'featured-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './featured-categories.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturedCategoriesComponent implements OnInit {
  @ViewChild('categoriesGrid', { static: false }) categoriesGrid!: ElementRef;

  readonly LaptopIcon = LaptopIcon;
  readonly SmartphoneIcon = SmartphoneIcon;
  readonly HeadphonesIcon = HeadphonesIcon;
  readonly WatchIcon = WatchIcon;
  readonly CameraIcon = CameraIcon;
  readonly TvIcon = TvIcon;
  readonly GamepadIcon = GamepadIcon;
  readonly PrinterIcon = PrinterIcon;

  categories: Category[] = [
    { id: 1, name: "Laptops", icon: LaptopIcon, href: "/productos?categoria=1", color: "bg-blue-50 text-blue-600" },
    { id: 2, name: "Smartphones", icon: SmartphoneIcon, href: "/productos?categoria=2", color: "bg-purple-50 text-purple-600" },
    { id: 3, name: "Audio", icon: HeadphonesIcon, href: "/productos?categoria=3", color: "bg-green-50 text-green-600" },
    { id: 4, name: "Wearables", icon: WatchIcon, href: "/productos?categoria=4", color: "bg-yellow-50 text-yellow-600" },
    { id: 5, name: "Cámaras", icon: CameraIcon, href: "/productos?categoria=5", color: "bg-red-50 text-red-600" },
    { id: 6, name: "Televisores", icon: TvIcon, href: "/productos?categoria=6", color: "bg-indigo-50 text-indigo-600" },
    { id: 7, name: "Gaming", icon: GamepadIcon, href: "/productos?categoria=7", color: "bg-pink-50 text-pink-600" },
    { id: 8, name: "Impresoras", icon: PrinterIcon, href: "/productos?categoria=8", color: "bg-teal-50 text-teal-600" }
  ];

  isVisible = signal(false);

  ngOnInit() {

    setTimeout(() => {
      this.setupScrollTrigger();
    }, 100);
  }

  private setupScrollTrigger() {
    if (!this.categoriesGrid) return;


    ScrollTrigger.create({
      trigger: this.categoriesGrid.nativeElement,
      start: "top 80%",
      onEnter: () => {
        this.isVisible.set(true);
        this.animateCategories();
      },
      once: true
    });
  }

  private animateCategories() {
    if (!this.categoriesGrid || !this.isVisible()) return;


    const categoryCards = this.categoriesGrid.nativeElement.querySelectorAll('.category-card');

    gsap.fromTo(categoryCards,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }
}
