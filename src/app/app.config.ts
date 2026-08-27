import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, enableIndexedDbPersistence } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';
import { FirebaseService } from './core/firebase/firebase.service';
import { FirebaseMockService } from './core/firebase/firebase.mock.service';
import { DATABASE_SERVICE } from './core/firebase/database.service';
import { BATCH_WRITE_SERVICE } from './core/store/batch-write.service';
import { BatchWriteMockService } from './core/store/batch-write.mock.service';
import { BatchWriteDBService } from './core/store/batch-write.firebase.service';
import { LogInDevService, LogDBService, LOG_SERVICE } from './core/analytics/log.service';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getPerformance, providePerformance } from '@angular/fire/performance';

const firebaseProviders = !environment.production && environment['mockDB'] ? [] : [
  provideFirebaseApp(() => initializeApp(environment.firebase)),
  provideFirestore(() => {
    const firestore = getFirestore();
    enableIndexedDbPersistence(firestore);
    return firestore;
  }),
  ...(environment.production ? [
    provideFirebaseApp(() => initializeApp(environment['firebaseLogs'], 'logs')),
    provideFirestore(() => {
      const firestore = getFirestore(getApp('logs'));
      // connectFirestoreEmulator(firestore, 'localhost', 8080);
      enableIndexedDbPersistence(firestore);
      return firestore;
    }),
  ] : []),
  provideAuth(() => getAuth()),
  provideFunctions(() => getFunctions()),
  providePerformance(() => getPerformance()),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
    ),
    provideAnimationsAsync(),
    ...firebaseProviders,
    {
      provide: LOG_SERVICE,
      useClass: !environment.production ? LogInDevService : LogDBService,
    },
    {
      provide: DATABASE_SERVICE,
      useClass: !environment.production && environment['mockDB'] ? FirebaseMockService : FirebaseService,
    },
    {
      provide: BATCH_WRITE_SERVICE,
      useClass: !environment.production && environment['mockDB'] ? BatchWriteMockService : BatchWriteDBService,
    },
  ],
};
