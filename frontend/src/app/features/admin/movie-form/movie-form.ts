import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { EMPTY, catchError, finalize, of, switchMap } from 'rxjs';
import { AdminMoviesApi } from '../../../core/api/admin-movies-api';
import { MovieRequest, MovieStatus } from '../../../core/models/movie';
import { Notifier } from '../../../core/notifications/notifier';

const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_COVER_BYTES = 2 * 1024 * 1024;

/** El backend acepta como máximo un decimal (NUMERIC(3,1)). */
function oneDecimal(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number | null;
  if (value === null || value === undefined) {
    return null;
  }
  return Math.abs(value * 10 - Math.round(value * 10)) < 1e-9 ? null : { oneDecimal: true };
}

@Component({
  selector: 'app-movie-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieForm {
  private readonly api = inject(AdminMoviesApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(Notifier);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly movieId = this.readMovieId();
  protected readonly isEdit = this.movieId !== null;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    score: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(10),
      oneDecimal,
    ]),
    status: this.fb.control<MovieStatus>('DRAFT', Validators.required),
  });

  protected readonly loading = signal(this.isEdit);
  protected readonly saving = signal(false);

  // Portada: la actual (del servidor) y la nueva elegida, con vista previa local.
  protected readonly currentCoverUrl = signal<string | null>(null);
  private readonly coverFile = signal<File | null>(null);
  protected readonly coverPreview = signal<string | null>(null);
  protected readonly coverError = signal<string | null>(null);
  protected readonly coverSrc = computed(() => this.coverPreview() ?? this.currentCoverUrl());

  constructor() {
    if (this.movieId !== null) {
      this.api
        .get(this.movieId)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (movie) => {
            this.form.setValue({
              title: movie.title,
              description: movie.description,
              score: movie.score,
              status: movie.status,
            });
            this.currentCoverUrl.set(movie.coverUrl);
            this.loading.set(false);
          },
          error: () => this.router.navigate(['/admin/movies']),
        });
    }

    this.destroyRef.onDestroy(() => this.revokePreview());
  }

  protected onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!file) {
      return;
    }
    if (!ALLOWED_COVER_TYPES.includes(file.type)) {
      this.coverError.set('Formato no permitido. Usa JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      this.coverError.set('La imagen supera los 2 MB.');
      return;
    }

    this.coverError.set(null);
    this.revokePreview();
    this.coverFile.set(file);
    this.coverPreview.set(URL.createObjectURL(file));
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: MovieRequest = {
      title: value.title.trim(),
      description: value.description.trim(),
      score: value.score as number,
      status: value.status,
    };

    this.saving.set(true);
    const save$ =
      this.movieId === null ? this.api.create(request) : this.api.update(this.movieId, request);

    save$
      .pipe(
        switchMap((movie) => {
          const file = this.coverFile();
          if (!file) {
            return of(movie);
          }
          return this.api.uploadCover(movie.id, file).pipe(
            catchError(() => {
              // La película ya se guardó: ir a su edición evita crearla dos veces al reintentar.
              this.router.navigate(['/admin/movies', movie.id, 'edit']);
              return EMPTY;
            }),
          );
        }),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notifier.success(this.isEdit ? 'Cambios guardados' : 'Película creada');
          this.router.navigate(['/admin/movies']);
        },
        error: () => undefined, // el interceptor ya mostró el mensaje
      });
  }

  private readMovieId(): number | null {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? Number(id) : null;
  }

  private revokePreview(): void {
    const preview = this.coverPreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }
}
