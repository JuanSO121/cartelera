import { Routes } from '@angular/router';
import { PublicLayout } from './public-layout/public-layout';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Cartelera',
        loadComponent: () => import('./catalog-page/catalog-page').then((m) => m.CatalogPage),
      },
      {
        path: 'my-rentals',
        title: 'Mis alquileres | Cartelera',
        loadComponent: () => import('./my-rentals/my-rentals').then((m) => m.MyRentals),
      },
      {
        path: 'movies/:id',
        title: 'Película | Cartelera',
        loadComponent: () => import('./movie-detail/movie-detail').then((m) => m.MovieDetail),
      },
    ],
  },
];
