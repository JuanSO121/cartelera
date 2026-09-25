import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Tira de navegación de la franja, con perforaciones como el borde de una película de 35 mm.
 * Se usa sobre un <button>, así conserva toda la semántica y accesibilidad nativas.
 */
@Component({
  selector: 'button[appReelButton]',
  imports: [MatIconModule],
  template: `
    <span class="icon"><mat-icon aria-hidden="true">{{ icon() }}</mat-icon></span>
    <span class="label" aria-hidden="true">{{ label() }}</span>
  `,
  host: { type: 'button', class: 'reel-button' },
  styles: `
    :host {
      --perforation: repeating-linear-gradient(to bottom, var(--c-line) 0 9px, transparent 9px 20px);

      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 20px 0;
      border: 1px solid var(--c-line);
      border-radius: var(--radius);
      background:
        var(--perforation) left 7px top 14px / 6px calc(100% - 28px) no-repeat,
        var(--perforation) right 7px top 14px / 6px calc(100% - 28px) no-repeat,
        var(--c-surface);
      color: var(--c-text);
      font: inherit;
      cursor: pointer;
    }
    :host(:hover:not(:disabled)) {
      border-color: var(--c-accent-strong);
    }
    :host(:disabled) {
      cursor: progress;
      opacity: 0.5;
    }
    :host(:focus-visible) {
      outline: 3px solid var(--c-accent-strong);
      outline-offset: -3px;
    }
    .icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--c-accent);
    }
    mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
    }
    .label {
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      font: 700 1.25rem / 1.2 var(--font-display);
      white-space: nowrap;
    }
    @media (max-width: 720px) {
      :host {
        --perforation: repeating-linear-gradient(to right, var(--c-line) 0 9px, transparent 9px 20px);

        flex-direction: row;
        justify-content: center;
        gap: 12px;
        padding: 0 20px;
        background:
          var(--perforation) left 14px top 7px / calc(100% - 28px) 6px no-repeat,
          var(--perforation) left 14px bottom 7px / calc(100% - 28px) 6px no-repeat,
          var(--c-surface);
      }
      .label {
        writing-mode: horizontal-tb;
        transform: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReelButton {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
}
