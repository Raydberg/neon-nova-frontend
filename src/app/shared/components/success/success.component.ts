import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css'],
})
export class SuccessComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    //  Redirigir automáticamente después de 3 segundos
    setTimeout(() => this.goToProducts(), 3000);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}
