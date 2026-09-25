import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PublicMovie } from '../../../core/models/movie';
import { Poster } from '../../../shared/poster/poster';
import { Score } from '../../../shared/score/score';
import { StripTail } from '../strip-tail/strip-tail';

/**
 * Tipo de cambio en curso, define la animación de la franja:
 * - `next` / `prev`: paginación; se desliza en ese sentido.
 * - `filter`: búsqueda u orden; la lista se desvanece y la nueva sube en cascada.
 */
export type StripMotion = 'next' | 'prev' | 'filter';

const MOBILE_QUERY = '(max-width: 720px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Franja de pósters: uno expandido con su información y el resto plegados.
 * Se expande con clic, toque o flechas del teclado. Al final (y al inicio desde la
 * segunda página) una cola de tiras indica que el catálogo continúa.
 */
@Component({
  selector: 'app-movie-strip',
  imports: [RouterLink, MatIconModule, Poster, Score, StripTail],
  templateUrl: './movie-strip.html',
  styleUrl: './movie-strip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieStrip {
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  readonly movies = input.required<PublicMovie[]>();
  /** Animación del cambio en curso. `null` en la carga inicial o un reintento. */
  readonly motion = input<StripMotion | null>(null);
  /** Mientras se carga otra lista, la franja actual sale de escena. */
  readonly busy = input(false);
  /** Películas en la página anterior y siguiente (0 = no hay). */
  readonly previousCount = input(0);
  readonly nextCount = input(0);

  readonly previous = output<void>();
  readonly next = output<void>();

  /** Vuelve al primer panel cada vez que cambia la lista (búsqueda, orden o página). */
  protected readonly selected = linkedSignal({ source: this.movies, computation: () => 0 });

  private readonly strip = viewChild.required<ElementRef<HTMLElement>>('strip');
  private readonly panels = viewChildren<ElementRef<HTMLElement>>('panel');
  private readonly triggers = viewChildren<ElementRef<HTMLButtonElement>>('trigger');
  private focusFirstAfterChange = false;

  constructor() {
    // Tras pasar de página desde una cola, el foco va a la primera película nueva
    // (en móvil, además, eso lleva la vista al inicio de la lista).
    effect(() => {
      this.movies();
      if (!this.focusFirstAfterChange) {
        return;
      }
      this.focusFirstAfterChange = false;
      afterNextRender(() => this.triggers()[0]?.nativeElement.focus(), { injector: this.injector });
    });
  }

  /** Mismo hash que usa `Poster` para su color de respaldo, aplicado como tinte. */
  protected hueFor(title: string): number {
    return [...title].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % 360;
  }

  /**
   * Un tap en un panel plegado lo expande. Un tap en el panel que ya está expandido
   * abre el detalle: en móvil el botón "Ver detalle" queda lejos del pulgar.
   */
  protected select(index: number, movie: PublicMovie): void {
    const previous = this.selected();
    if (index === previous) {
      this.router.navigate(['/movies', movie.id], { state: { fromCatalog: true } });
      return;
    }
    this.selected.set(index);
    this.centerOnMobile(index, previous);
  }

  protected goPrevious(): void {
    this.focusFirstAfterChange = true;
    this.previous.emit();
  }

  protected goNext(): void {
    this.focusFirstAfterChange = true;
    this.next.emit();
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

  /**
   * En móvil (lista vertical) centra en pantalla el panel que se abre.
   * Calcula su posición final, cuando terminen las transiciones de altura, para que el
   * desplazamiento ocurra a la vez que la animación y no después.
   */
  private centerOnMobile(index: number, previous: number): void {
    if (!matchMedia(MOBILE_QUERY).matches) {
      return;
    }
    const panel = this.panels()[index]?.nativeElement;
    if (!panel) {
      return;
    }

    const styles = getComputedStyle(this.strip().nativeElement);
    const collapsed = parseFloat(styles.getPropertyValue('--collapsed-h'));
    const expanded = parseFloat(styles.getPropertyValue('--expanded-h'));
    const gap = parseFloat(styles.getPropertyValue('--expanded-gap')) || 0;

    // Si el panel que se cierra está arriba, todo lo de abajo sube lo que él encoge.
    const shrinkAbove = previous < index ? expanded - collapsed + gap * 2 : 0;
    const finalTop = panel.getBoundingClientRect().top + window.scrollY - shrinkAbove + gap;
    const offset = Math.max(16, (window.innerHeight - expanded) / 2);

    window.scrollTo({
      top: Math.max(0, finalTop - offset),
      behavior: matchMedia(REDUCED_MOTION_QUERY).matches ? 'auto' : 'smooth',
    });
  }
}
