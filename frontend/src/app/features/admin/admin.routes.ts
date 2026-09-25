import { Routes } from '@angular/router';
import { AdminLayout } from './admin-layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'movies' },
      {
        path: 'movies',
        title: 'Películas | Administración',
        loadComponent: () => import('./movie-list/movie-list').then((m) => m.MovieList),
      },
      {
        path: 'movies/new',
        title: 'Nueva película | Administración',
        loadComponent: () => import('./movie-form/movie-form').then((m) => m.MovieForm),
      },
      {
        path: 'movies/:id/edit',
        title: 'Editar película | Administración',
        loadComponent: () => import('./movie-form/movie-form').then((m) => m.MovieForm),
      },
    ],
  },
];
