import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'personal-info-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: "./personal-info-form.component.html"
})
export class PersonalInfoFormComponent {
  parentForm = input.required<FormGroup>();
}
