import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import localePt from '@angular/common/locales/pt'
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    {provide: LOCALE_ID, useValue: 'pt-BR'}
  ]
};
