import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Remate de la franja que indica que el catálogo continúa: tiras cada vez más delgadas
 * y tenues, como un rollo que sigue fuera de cuadro. Es un botón: tocarlo cambia de página.
 * Con `side="start"` se dibuja en espejo, al inicio de la franja.
 */
@Component({
  selector: 'button[appStripTail]',
  imports: [MatIconModule],
  template: `
    <span class="slivers" aria-hidden="true">
      @for (sliver of slivers(); track sliver) {
        <span class="sliver" [style.--n]="sliver"></span>
      }
    </span>
    <span class="hint" aria-hidden="true">
      <span class="chip"><mat-icon>{{ side() === 'end' ? 'arrow_forward' : 'arrow_back' }}</mat-icon></span>
      <span class="text">{{ label() }}</span>
    </span>
  `,
  host: {
    type: 'button',
    '[class.start]': "side() === 'start'",
  },
  styleUrl: './strip-tail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StripTail {
  readonly side = input<'start' | 'end'>('end');
  /** Texto corto visible, por ejemplo "8 más". El nombre accesible va en aria-label. */
  readonly label = input.required<string>();

  /** 0 es la tira más cercana a las películas; cada una siguiente es más delgada y tenue. */
  protected readonly slivers = computed(() => (this.side() === 'end' ? [0, 1, 2, 3] : [3, 2, 1, 0]));
}
