import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RentalsApi } from '../../../core/api/rentals-api';
import { PublicMovie } from '../../../core/models/movie';
import { Rental } from '../../../core/models/rental';
import { displayName, firstName } from '../../../shared/text/display-name';

type PanelState = 'idle' | 'form' | 'saving' | 'done';

/**
 * Alquiler dentro del detalle: el botón se transforma en una fila de campos integrada
 * en la tarjeta (sin modal ni caja aparte) y, al confirmar, en un boleto de cine.
 */
@Component({
  selector: 'app-rent-panel',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, MatIconModule],
  templateUrl: './rent-panel.html',
  styleUrl: './rent-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RentPanel {
  private readonly api = inject(RentalsApi);
  private readonly injector = inject(Injector);

  readonly movie = input.required<PublicMovie>();

  protected readonly state = signal<PanelState>('idle');
  protected readonly rental = signal<Rental | null>(null);
  protected readonly email = signal('');
  protected readonly holder = computed(() => displayName(this.rental()?.customerName ?? ''));
  protected readonly greeting = computed(() => firstName(this.rental()?.customerName ?? ''));

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  private readonly nameInput = viewChild<ElementRef<HTMLInputElement>>('nameInput');
  private readonly ticket = viewChild<ElementRef<HTMLElement>>('ticket');
  private readonly openButton = viewChild<ElementRef<HTMLButtonElement>>('openButton');

  protected open(): void {
    this.state.set('form');
    afterNextRender(() => this.nameInput()?.nativeElement.focus(), { injector: this.injector });
  }

  protected cancel(): void {
    this.state.set('idle');
    afterNextRender(() => this.openButton()?.nativeElement.focus(), { injector: this.injector });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email } = this.form.getRawValue();
    this.state.set('saving');
    this.api
      .rent({ movieId: this.movie().id, customerName: name.trim(), customerEmail: email.trim() })
      .subscribe({
        next: (rental) => {
          this.rental.set(rental);
          this.email.set(email.trim());
          this.state.set('done');
          // El foco pasa al boleto, para que un lector de pantalla anuncie la confirmación.
          afterNextRender(() => this.ticket()?.nativeElement.focus(), { injector: this.injector });
        },
        error: () => this.state.set('form'), // el interceptor ya mostró el motivo
      });
  }
}
