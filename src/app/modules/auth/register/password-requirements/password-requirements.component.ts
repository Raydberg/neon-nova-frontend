import {Component, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'register-password-requirements',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: "./password-requirements.component.html"
})
export class PasswordRequirementsComponent {
  requirements = input<{
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
}
