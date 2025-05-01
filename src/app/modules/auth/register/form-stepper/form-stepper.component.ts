import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'register-form-stepper',
  imports: [CommonModule],
  template: `
    <div class="overflow-hidden">
      <ul class="steps w-full mb-6">
        <li
          *ngFor="let step of steps(); let i = index"
          class="step step-transition"
          [ngClass]="{
            'step-primary': currentStep() >= i + 1,
            'step-active': currentStep() === i + 1
          }"
        >
          {{ step }}
        </li>
      </ul>
    </div>
  `
})
export class FormStepperComponent {
  steps = input<string[]>(['Información', 'Credenciales']);
  currentStep = input<number>(1);
}
