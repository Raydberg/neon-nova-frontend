import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'password-strength-indicator',
  imports: [CommonModule],
  template: `
    <div class="mt-2 animate-fade-in">
      <div class="flex justify-between mb-1">
        <span
          class="text-xs"
          [ngClass]="{
            'text-error': strength() === 'weak',
            'text-warning': strength() === 'medium',
            'text-success': strength() === 'strong'
          }"
        >
          Fortaleza: {{ getStrengthText() }}
        </span>
      </div>
      <progress
        class="progress w-full"
        [ngClass]="getStrengthClass()"
        [value]="getStrengthPercentage()"
        max="100"
      ></progress>
    </div>
  `
})
export class PasswordStrengthIndicatorComponent {
  strength = input<'weak' | 'medium' | 'strong' | null>(null);

  getStrengthClass(): string {
    switch (this.strength()) {
      case 'weak': return 'progress-error';
      case 'medium': return 'progress-warning';
      case 'strong': return 'progress-success';
      default: return '';
    }
  }

  getStrengthPercentage(): number {
    switch (this.strength()) {
      case 'weak': return 33;
      case 'medium': return 66;
      case 'strong': return 100;
      default: return 0;
    }
  }

  getStrengthText(): string {
    switch (this.strength()) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }
}
