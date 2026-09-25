import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, MatIconModule],
  template: `
    <header class="bar">
      <a routerLink="/" class="brand">Cartelera</a>
      <a routerLink="/admin" class="admin-link">
        <mat-icon aria-hidden="true">settings</mat-icon>
        Administrar
      </a>
    </header>
    <main class="content"><router-outlet /></main>
  `,
  styleUrl: './public-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {}
