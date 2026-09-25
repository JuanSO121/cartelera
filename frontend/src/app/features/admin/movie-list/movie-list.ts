import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, switchMap, tap } from 'rxjs';
import { AdminMoviesApi } from '../../../core/api/admin-movies-api';
import { AdminMovieQuery, MOVIE_STATUS_LABELS, Movie, MovieStatus } from '../../../core/models/movie';
import { Notifier } from '../../../core/notifications/notifier';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-movie-list',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieList {
  private readonly api = inject(AdminMoviesApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);

  protected readonly columns = ['cover', 'title', 'score', 'status', 'updatedAt', 'actions'];
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  // Filtros y paginación
  protected readonly search = signal('');
  protected readonly status = signal<MovieStatus | ''>('');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  private readonly reloadCount = signal(0);

  // Resultado
  protected readonly movies = signal<Movie[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly hasFilters = computed(() => this.search() !== '' || this.status() !== '');

  private readonly query = computed<AdminMovieQuery>(() => {
    this.reloadCount(); // permite forzar una recarga tras editar o borrar
    return { search: this.search(), status: this.status(), page: this.pageIndex(), size: this.pageSize() };
  });

  constructor() {
    // La búsqueda espera 300 ms sin escribir antes de consultar.
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        map((value) => value.trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        this.pageIndex.set(0);
        this.search.set(value);
      });

    // Cada cambio en la consulta cancela la petición anterior (switchMap).
    toObservable(this.query)
      .pipe(
        tap(() => this.loading.set(true)),
        switchMap((query) => this.api.list(query).pipe(catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.loading.set(false);
        if (page) {
          this.movies.set(page.content);
          this.total.set(page.totalElements);
        }
      });
  }

  protected statusLabel(status: MovieStatus): string {
    return MOVIE_STATUS_LABELS[status];
  }

  protected onStatusChange(status: MovieStatus | ''): void {
    this.pageIndex.set(0);
    this.status.set(status);
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected toggleStatus(movie: Movie): void {
    const status: MovieStatus = movie.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    this.api
      .update(movie.id, { title: movie.title, description: movie.description, score: movie.score, status })
      .subscribe({
        next: () => {
          this.notifier.success(
            status === 'PUBLISHED' ? `"${movie.title}" publicada` : `"${movie.title}" pasó a edición`,
          );
          this.reload();
        },
        error: () => undefined, // el interceptor ya mostró el mensaje
      });
  }

  protected confirmDelete(movie: Movie): void {
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Borrar película',
          message: `Se borrará "${movie.title}" y su portada. Esta acción no se puede deshacer.`,
          confirmLabel: 'Borrar',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.api.delete(movie.id)),
      )
      .subscribe({
        next: () => {
          this.notifier.success(`"${movie.title}" borrada`);
          // Si era la última de la página, volver a la anterior.
          if (this.movies().length === 1 && this.pageIndex() > 0) {
            this.pageIndex.update((page) => page - 1);
          } else {
            this.reload();
          }
        },
        error: () => undefined,
      });
  }

  private reload(): void {
    this.reloadCount.update((count) => count + 1);
  }
}
