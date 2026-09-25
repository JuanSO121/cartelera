import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Page, PublicMovie, PublicMovieQuery } from '../models/movie';

@Injectable({ providedIn: 'root' })
export class PublicMoviesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/movies';

  list(query: PublicMovieQuery): Observable<Page<PublicMovie>> {
    const params = new HttpParams()
      .set('search', query.search)
      .set('sort', query.sort)
      .set('page', query.page)
      .set('size', query.size);
    return this.http.get<Page<PublicMovie>>(this.baseUrl, { params });
  }

  get(id: number): Observable<PublicMovie> {
    return this.http.get<PublicMovie>(`${this.baseUrl}/${id}`);
  }
}
