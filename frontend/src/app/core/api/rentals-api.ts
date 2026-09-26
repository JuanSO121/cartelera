import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Rental, RentalRequest } from '../models/rental';

@Injectable({ providedIn: 'root' })
export class RentalsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/rentals';

  rent(request: RentalRequest): Observable<Rental> {
    return this.http.post<Rental>(this.baseUrl, request);
  }

  findByEmail(email: string): Observable<Rental[]> {
    return this.http.get<Rental[]>(this.baseUrl, { params: new HttpParams().set('email', email) });
  }

  giveBack(id: number, customerEmail: string): Observable<Rental> {
    return this.http.patch<Rental>(`${this.baseUrl}/${id}/return`, { customerEmail });
  }
}
