import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <header class="bar">
      <a routerLink="/" class="brand">Cartelera</a>
      <nav class="nav" aria-label="Principal">
        <a routerLink="/my-rentals" routerLinkActive="active" class="nav-link">
          <mat-icon aria-hidden="true">confirmation_number</mat-icon>
          Mis alquileres
        </a>
        <a routerLink="/admin" class="admin-link">
          <mat-icon aria-hidden="true">settings</mat-icon>
          Administrar
        </a>
      </nav>
    </header>
    <main class="content"><router-outlet /></main>
  `,
  styleUrl: './public-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {}
