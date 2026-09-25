import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';

/**
 * Muestra la portada de una película. Si no tiene, genera un fondo de color
 * estable derivado del título, para que el catálogo no se vea vacío.
 */
@Component({
  selector: 'app-poster',
  template: `
    @if (visibleCover(); as src) {
      <img [src]="src" [alt]="alt()" loading="lazy" decoding="async" (error)="failed.set(true)" />
    } @else {
      <div
        class="placeholder"
        [style.--hue]="hue()"
        [attr.role]="alt() ? 'img' : null"
        [attr.aria-label]="alt() || null"
        [attr.aria-hidden]="alt() ? null : 'true'"
      >
        @if (showTitle()) {
          <span>{{ title() }}</span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      overflow: hidden;
      container-type: inline-size;
    }
    img,
    .placeholder {
      display: block;
      width: 100%;
      height: 100%;
    }
    img {
      object-fit: cover;
    }
    .placeholder {
      display: flex;
      align-items: flex-end;
      box-sizing: border-box;
      padding: 10cqi;
      background:
        radial-gradient(120% 80% at 15% 0%, hsl(var(--hue) 70% 72% / 0.9), transparent 65%),
        linear-gradient(165deg, hsl(var(--hue) 45% 52%), hsl(calc(var(--hue) + 40) 42% 30%));
    }
    span {
      font: 800 16cqi / 0.95 var(--font-display, sans-serif);
      color: rgb(255 255 255 / 0.92);
      text-shadow: 0 2px 12px rgb(0 0 0 / 0.25);
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Poster {
  readonly title = input.required<string>();
  readonly coverUrl = input<string | null>(null);
  /** Texto alternativo. Vacío cuando el título ya se muestra al lado (imagen decorativa). */
  readonly alt = input('');
  readonly showTitle = input(true);

  /** Si la imagen falla al cargar, se muestra el fondo generado en lugar de una imagen rota. */
  protected readonly failed = linkedSignal({ source: this.coverUrl, computation: () => false });
  protected readonly visibleCover = computed(() => (this.failed() ? null : this.coverUrl()));

  protected readonly hue = computed(() =>
    [...this.title()].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7) % 360,
  );
}
