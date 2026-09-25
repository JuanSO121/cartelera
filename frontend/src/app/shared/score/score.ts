import { DecimalPipe, formatNumber } from '@angular/common';
import { ChangeDetectionStrategy, Component, LOCALE_ID, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-score',
  imports: [DecimalPipe],
  template: `
    <span class="star" aria-hidden="true">★</span>
    <span aria-hidden="true">{{ value() | number: '1.1-1' }}</span>
    <span class="max" aria-hidden="true">/10</span>
  `,
  host: {
    role: 'img',
    '[attr.aria-label]': 'label()',
    '[class.large]': "size() === 'large'",
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      font-weight: 600;
      font-size: 1.125rem;
      line-height: 1;
    }
    :host(.large) {
      font-size: 1.75rem;
    }
    .star {
      color: var(--c-star, #9a6b12);
    }
    .max {
      font-size: 0.75em;
      font-weight: 500;
      opacity: 0.7;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Score {
  private readonly locale = inject(LOCALE_ID);

  readonly value = input.required<number>();
  readonly size = input<'normal' | 'large'>('normal');

  protected readonly label = computed(
    () => `Puntaje ${formatNumber(this.value(), this.locale, '1.1-1')} de 10`,
  );
}
