import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar class="topbar">
      <a routerLink="/admin" class="brand">Cartelera</a>
      <span class="section">Administración</span>
      <span class="spacer"></span>
      <a matButton routerLink="/">Ver catálogo</a>
    </mat-toolbar>
    <main><router-outlet /></main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--mat-sys-surface);
    }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      gap: 12px;
      background: var(--mat-sys-surface-container);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }
    .brand {
      font: var(--mat-sys-title-large);
      color: var(--mat-sys-on-surface);
      text-decoration: none;
    }
    .section {
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
    }
    .spacer {
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {}
