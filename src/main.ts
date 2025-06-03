import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER } from '@angular/core';
import { registerNotificationActions } from './app/utils/intializers';

bootstrapApplication(AppComponent, {
  providers: [
    // Register the notification actions on app initialization
    { provide: APP_INITIALIZER, useFactory: registerNotificationActions, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
