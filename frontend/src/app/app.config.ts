import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';
import { errorInterceptor } from './core/http/error-interceptor';
import { SpanishPaginatorIntl } from './core/i18n/spanish-paginator-intl';

// Fechas y números en español: "19 de septiembre de 2026", "8,5".
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Cada navegación empieza arriba: sin esto, al abrir el detalle de una película
    // desde un catálogo scrolleado, la nueva página conserva el scroll y aparece descuadrada.
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    provideHttpClient(withInterceptors([errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl },
  ],
};
