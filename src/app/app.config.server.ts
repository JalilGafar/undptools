// src/app/app.config.server.ts
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';

const serverRoutes = [
  { path: 'ssr-route', renderMode: 'server' },
  { path: 'prerender-route', renderMode: 'prerender' },
  { path: '**', renderMode: 'client' }, // Default to client-side rendering
];

const serverAppConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverAppConfig);