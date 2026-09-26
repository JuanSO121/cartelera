import { DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { filter, switchMap } from 'rxjs';
import { RentalsApi } from '../../../core/api/rentals-api';
import { Rental } from '../../../core/models/rental';
import { Notifier } from '../../../core/notifications/notifier';
import { ConfirmDialog, ConfirmDialogData } from '../../../shared/confirm-dialog/confirm-dialog';
import { Poster } from '../../../shared/poster/poster';

const HOUR_MS = 60 * 60 * 1000;

@Component({
  selector: 'app-my-rentals',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, MatIconModule, Poster],
  templateUrl: './my-rentals.html',
  styleUrl: './my-rentals.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyRentals {
  private readonly api = inject(RentalsApi);
  private readonly dialog = inject(MatDialog);
  private readonly notifier = inject(Notifier);

  // El FormGroup no es decorativo: [formGroup] es lo que hace que (ngSubmit) intercepte
  // el envío. Sin él, el navegador enviaría el formulario y recargaría la página.
  protected readonly lookupForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });
  protected readonly emailControl = this.lookupForm.controls.email;

  /** Correo de la última consulta exitosa: con él se devuelven los alquileres. */
  protected readonly email = signal<string | null>(null);
  protected readonly rentals = signal<Rental[] | null>(null);
  protected readonly loading = signal(false);

  /** Activos: los vencidos primero, luego por fecha límite más próxima. */
  protected readonly active = computed(() =>
    (this.rentals() ?? [])
      .filter((rental) => rental.status === 'ACTIVE')
      .sort((a, b) => Number(b.overdue) - Number(a.overdue) || a.dueDate.localeCompare(b.dueDate)),
  );
  protected readonly history = computed(() =>
    (this.rentals() ?? []).filter((rental) => rental.status === 'RETURNED'),
  );

  constructor() {
    // Si se llega desde la confirmación de un alquiler, el correo viene en el estado de la
    // navegación (no en la URL, para que no quede en el historial) y la lista se carga sola.
    const state = inject(Location).getState() as { email?: string } | null;
    if (state?.email) {
      this.emailControl.setValue(state.email);
      this.search();
    }
  }

  protected search(): void {
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    const email = this.emailControl.value.trim();
    this.loading.set(true);
    this.api.findByEmail(email).subscribe({
      next: (rentals) => {
        this.rentals.set(rentals);
        this.email.set(email);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected hoursLeft(rental: Rental): number {
    return Math.max(1, Math.ceil((Date.parse(rental.dueDate) - Date.now()) / HOUR_MS));
  }

  protected giveBack(rental: Rental): void {
    const email = this.email();
    if (!email) {
      return;
    }
    this.dialog
      .open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
        data: {
          title: 'Devolver película',
          message: `¿Terminar el alquiler de "${rental.movieTitle}"? Dejarás de tenerla disponible.`,
          confirmLabel: 'Devolver',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.api.giveBack(rental.id, email)),
      )
      .subscribe({
        next: (updated) => {
          this.rentals.update((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
          this.notifier.success(`Devolviste "${updated.movieTitle}"`);
        },
        error: () => undefined, // el interceptor ya mostró el motivo
      });
  }
}
