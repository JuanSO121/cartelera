import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  linkedSignal,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PublicMovie } from '../../../core/models/movie';
import { Poster } from '../../../shared/poster/poster';
import { Score } from '../../../shared/score/score';

/** Sentido en el que se navegó entre páginas; define hacia dónde se desliza la franja. */
export type PageDirection = 'next' | 'prev';

/**
 * Franja de pósters: uno expandido con su información y el resto plegados.
 * Se expande con clic, toque o flechas del teclado.
 *
 * Es puramente presentacional: la paginación vive en la cabecera del catálogo.
 * Al cambiar de página, la franja saliente se desliza fuera mientras carga y la nueva entra
 * desde el lado contrario, para que se entienda el sentido del movimiento.
 */
@Component({
  selector: 'app-movie-strip',
  imports: [RouterLink, Poster, Score],
  templateUrl: './movie-strip.html',
  styleUrl: './movie-strip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieStrip {
  private readonly router = inject(Router);

  readonly movies = input.required<PublicMovie[]>();
  /** Sentido de la paginación en curso. `null` en búsquedas u orden: sin deslizamiento. */
  readonly direction = input<PageDirection | null>(null);
  /** Mientras se carga otra lista, la franja actual sale de escena. */
  readonly busy = input(false);

  /** Vuelve al primer panel cada vez que cambia la lista (búsqueda, orden o página). */
  protected readonly selected = linkedSignal({ source: this.movies, computation: () => 0 });

  private readonly triggers = viewChildren<ElementRef<HTMLButtonElement>>('trigger');

  /**
   * Un tap en un panel plegado lo expande. Un tap en el panel que ya está expandido
   * abre el detalle: siempre hay uno expandido, así que "volver a tocar" no tiene
   * un estado de "cerrado" al que ir, y en móvil el CTA queda lejos del pulgar.
   */
  protected select(index: number, movie: PublicMovie): void {
    if (index === this.selected()) {
      this.router.navigate(['/movies', movie.id], { state: { fromCatalog: true } });
      return;
    }
    this.selected.set(index);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const last = this.movies().length - 1;
    let target: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      target = Math.min(index + 1, last);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      target = Math.max(index - 1, 0);
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = last;
    }

    if (target === null) {
      return;
    }
    event.preventDefault();
    this.selected.set(target);
    this.triggers()[target]?.nativeElement.focus();
  }
}
