import { Injectable, signal, computed, effect } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSignal = signal<Theme>(this.getInitialTheme());

  theme = computed(() => this.themeSignal());
  isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    effect(() => {
      this.applyTheme(this.themeSignal());
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('theme') === null) {
        this.themeSignal.set(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.themeSignal.set(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    localStorage.setItem('theme', theme);
  }

  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
   
  private applyTheme(theme: Theme): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.setAttribute('data-theme', theme);
  }
}
