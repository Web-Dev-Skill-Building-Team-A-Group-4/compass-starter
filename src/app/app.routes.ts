import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // First-Time User Experience Routes
  {
    path: 'landing', loadComponent: () => import('./first-time/landing/landing.component')
      .then((mod) => mod.LandingComponent), canActivate: [AuthGuard]
  },
  {
    path: 'onboarding', loadComponent: () => import('./first-time/onboarding/onboarding.component')
      .then((mod) => mod.OnboardingComponent), canActivate: [AuthGuard]
  },
  {
    path: 'onboarding/weekly-goals', loadComponent: () => import('./first-time/onboarding/step-pages/onboard-weekly-goals/onboard-weekly-goals.component')
      .then((mod) => mod.OnboardWeeklyGoalsComponent), canActivate: [AuthGuard]
  },
  // Main Routes
  {
    path: 'home', loadComponent: () => import('./main/home/home.component')
      .then((mod) => mod.HomeComponent), canActivate: [AuthGuard]
  },
  {
    path: 'notes-and-resources/:goalId', loadComponent: () => import('./main/notes-and-resources/notes-and-resources.component')
      .then((mod) => mod.NotesAndResourcesComponent), canActivate: [AuthGuard]
  },
  {
    path: 'reflect', loadComponent: () => import('./main/reflect/reflect.component')
      .then((mod) => mod.ReflectComponent), canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: 'landing', pathMatch: 'full' },
];
