import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutPersonalResponse, CheckoutRequest } from '../interfaces/checkout-http.interface';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}`

  checkoutFormPersonalInfo(personalInfo: CheckoutRequest): Observable<CheckoutPersonalResponse> {
    console.log('Sending checkout data:', personalInfo);

    return this.http.post<CheckoutPersonalResponse>(`${this.baseUrl}/checkout/personal-info`, personalInfo)
      .pipe(
        catchError(error => {
          console.error("Error al registrar la dirección del usuario", error);

          // Extract more specific error message if available
          let errorMsg = "Error al registrar los datos del usuario";
          if (error.error && error.error.errors) {
            // Try to extract validation errors
            const validationErrors = Object.values(error.error.errors).flat();
            if (validationErrors.length > 0) {
              errorMsg = validationErrors.join(', ');
            }
          } else if (error.error && error.error.message) {
            errorMsg = error.error.message;
          }

          return throwError(() => new Error(errorMsg));
        })
      );
  }

}
