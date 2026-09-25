import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminMovieQuery, Movie, MovieRequest, Page } from '../models/movie';

@Injectable({ providedIn: 'root' })
export class AdminMoviesApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/admin/movies';

  list(query: AdminMovieQuery): Observable<Page<Movie>> {
    let params = new HttpParams()
      .set('search', query.search)
      .set('page', query.page)
      .set('size', query.size);
    if (query.status) {
      params = params.set('status', query.status);
    }
    return this.http.get<Page<Movie>>(this.baseUrl, { params });
  }

  get(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
  }

  create(movie: MovieRequest): Observable<Movie> {
    return this.http.post<Movie>(this.baseUrl, movie);
  }

  update(id: number, movie: MovieRequest): Observable<Movie> {
    return this.http.put<Movie>(`${this.baseUrl}/${id}`, movie);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadCover(id: number, file: File): Observable<Movie> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<Movie>(`${this.baseUrl}/${id}/cover`, body);
  }
}
