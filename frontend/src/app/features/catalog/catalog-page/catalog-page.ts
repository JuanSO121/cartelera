import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { PublicMoviesApi } from '../../../core/api/public-movies-api';
import { MovieSort, Page, PublicMovie, PublicMovieQuery } from '../../../core/models/movie';
import { MovieStrip, PageDirection } from '../movie-strip/movie-strip';

const PAGE_SIZE = 8;
/** Duración de la salida de la franja; la nueva página no se muestra antes para no cortarla. */
const PAGE_EXIT_MS = 200;

@Component({
  selector: 'app-catalog-page',
  imports: [ReactiveFormsModule, MatIconModule, MovieStrip],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly api = inject(PublicMoviesApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // La URL es la fuente de verdad: ?q=matrix&sort=score&page=2
  private readonly params = toSignal(this.route.queryParamMap, { requireSync: true });
  protected readonly search = computed(() => (this.params().get('q') ?? '').trim());
  protected readonly sort = computed<MovieSort>(() =>
    this.params().get('sort') === 'score' ? 'score' : 'recent',
  );
  protected readonly page = computed(() => {
    const page = Number(this.params().get('page'));
    return Number.isInteger(page) && page > 1 ? page - 1 : 0;
  });

  protected readonly searchControl = new FormControl(this.search(), { nonNullable: true });
  protected readonly skeletonPanels = Array.from({ length: PAGE_SIZE }, (_, i) => i);

  private readonly retryCount = signal(0);
  protected readonly result = signal<Page<PublicMovie> | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  protected readonly movies = computed(() => this.result()?.content ?? []);
  protected readonly total = computed(() => this.result()?.totalElements ?? 0);
  protected readonly totalPages = computed(() => this.result()?.totalPages ?? 0);
  protected readonly hasPrevious = computed(() => this.page() > 0);
  protected readonly hasNext = computed(() => this.page() + 1 < this.totalPages());

  /** Sentido de la última paginación (`null` si el cambio fue por búsqueda, orden o reintento). */
  protected readonly direction = signal<PageDirection | null>(null);
  private lastQuery: PublicMovieQuery | null = null;

  /** "16 películas" en una sola página; "9–16 de 16 películas" cuando hay varias. */
  protected readonly summary = computed(() => {
    const total = this.total();
    const search = this.search();
    const noun = search ? (total === 1 ? 'resultado' : 'resultados') : total === 1 ? 'película' : 'películas';
    const suffix = search ? ` para “${search}”` : '';

    if (this.totalPages() <= 1) {
      return `${total} ${noun}${suffix}`;
    }
    const start = this.page() * PAGE_SIZE + 1;
    const end = start + this.movies().length - 1;
    return `${start}–${end} de ${total} ${noun}${suffix}`;
  });

  private readonly query = computed<PublicMovieQuery>(() => {
    this.retryCount();
    return { search: this.search(), sort: this.sort(), page: this.page(), size: PAGE_SIZE };
  });

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((search) => this.updateParams({ q: search || null, page: null }, true));

    // Mantiene el campo al día si la URL cambia (por ejemplo, con el botón atrás).
    effect(() => {
      const search = this.search();
      if (this.searchControl.value.trim() !== search) {
        this.searchControl.setValue(search, { emitEvent: false });
      }
    });

    toObservable(this.query)
      .pipe(
        tap((query) => {
          this.direction.set(this.directionFor(query));
          this.lastQuery = query;
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap((query) => {
          const request$ = this.api.list(query).pipe(
            catchError(() => {
              this.failed.set(true);
              return of(null);
            }),
          );
          // Al paginar se espera a que termine la animación de salida, aunque la API responda antes.
          return this.direction()
            ? forkJoin([request$, timer(PAGE_EXIT_MS)]).pipe(map(([page]) => page))
            : request$;
        }),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.loading.set(false);
        if (page) {
          this.result.set(page);
        }
      });
  }

  protected setSort(sort: MovieSort): void {
    if (sort !== this.sort()) {
      this.updateParams({ sort: sort === 'score' ? 'score' : null, page: null });
    }
  }

  protected goToPage(page: number): void {
    this.updateParams({ page: page > 0 ? page + 1 : null });
  }

  protected previousPage(): void {
    if (this.hasPrevious() && !this.loading()) {
      this.goToPage(this.page() - 1);
    }
  }

  protected nextPage(): void {
    if (this.hasNext() && !this.loading()) {
      this.goToPage(this.page() + 1);
    }
  }

  protected clearSearch(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.updateParams({ q: null, page: null });
  }

  protected retry(): void {
    this.retryCount.update((count) => count + 1);
  }

  /** Deduce el sentido comparando con la consulta anterior; así también sirve el botón atrás. */
  private directionFor(query: PublicMovieQuery): PageDirection | null {
    const last = this.lastQuery;
    if (!last || last.search !== query.search || last.sort !== query.sort || last.page === query.page) {
      return null;
    }
    return query.page > last.page ? 'next' : 'prev';
  }

  private updateParams(queryParams: Params, replaceUrl = false): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }
}
