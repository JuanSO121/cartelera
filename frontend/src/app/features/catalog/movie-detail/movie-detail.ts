import { DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PublicMoviesApi } from '../../../core/api/public-movies-api';
import { PublicMovie } from '../../../core/models/movie';
import { Poster } from '../../../shared/poster/poster';
import { Score } from '../../../shared/score/score';

@Component({
  selector: 'app-movie-detail',
  imports: [DatePipe, RouterLink, MatIconModule, Poster, Score],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetail {
  private readonly api = inject(PublicMoviesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly title = inject(Title);

  protected readonly movie = signal<PublicMovie | null>(null);
  protected readonly notFound = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.movie.set(null);
          this.notFound.set(false);
        }),
        switchMap((id) =>
          this.api.get(id).pipe(
            catchError(() => {
              this.notFound.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((movie) => {
        if (movie) {
          this.movie.set(movie);
          this.title.setTitle(`${movie.title} | Cartelera`);
        }
      });
  }

  /** Vuelve al catálogo conservando la búsqueda, el orden y la página si se llegó desde allí. */
  protected back(): void {
    const state = this.location.getState() as { fromCatalog?: boolean } | null;
    if (state?.fromCatalog) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
