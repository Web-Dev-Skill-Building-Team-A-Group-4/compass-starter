import { Inject, inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { OnboardingState, User } from '../store/user/user.model';
import { AuthStore } from '../store/auth/auth.store';
import { filter, switchMap, take } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { DATABASE_SERVICE, DatabaseService } from '../firebase/database.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  readonly authStore = inject(AuthStore);
  user$: Observable<User>;

  constructor(
    private router: Router,
    @Inject(DATABASE_SERVICE) private db: DatabaseService,
  ) {
    // This is only used when we have a signed in user, so we want to filter
    // out the values before the user has been loaded into the store
    this.user$ = toObservable(this.authStore.user).pipe(
      filter((user) => !!user),
    );
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.db.afUser().pipe(
      switchMap((afUser) => afUser ? this.user$.pipe(take(1)) : of(null)),
      switchMap((dbUser) => {
        // The overall approach is that we have a sequence of things we need to check (signed in, consent, waiting, walkthrough).
        // - For each, we want to make sure people not past that stage can't see past it,
        // - We also want to make sure people already past that stage get auto-moved past that page,
        // - We preserve queryParams in case we want to support things like referral links in the future

        // First handle all not logged in cases. If not logged in, users can only go to landing
        if (!dbUser) {
          if (state.url === '/' || state.url === '/landing') {
            return of(true);
          } else {
            this.router.navigate(['/'], { queryParams: next.queryParams });
            return of(false);
          }
        }

        // AFTER THIS POINT, THE USER MUST BE LOGGED IN (i.e. dbUser exists)

        // If logged in and trying to access landing, redirect to the homepage
        if (state.url === '/' || state.url === '/landing') {
          this.router.navigate(['/home'], { queryParams: next.queryParams });
          return of(false);
        }

        const onboardingStates = [OnboardingState.WELCOME, OnboardingState.STEP_1, OnboardingState.STEP_2, OnboardingState.STEP_3, OnboardingState.STEP_4, OnboardingState.STEP_5, OnboardingState.STEP_6, OnboardingState.STEP_7];
        if (onboardingStates.includes(dbUser.onboardingState) && state.url !== '/onboarding') {
          this.router.navigate(['/onboarding'], { queryParams: next.queryParams });
          return of(false);
        } else if (onboardingStates.includes(dbUser.onboardingState) && state.url === '/onboarding') {
          return of(true);
        } else if (!onboardingStates.includes(dbUser.onboardingState) && state.url === '/onboarding') {
          this.router.navigate(['/home'], { queryParams: next.queryParams });
          return of(false);
        }

        // For anything else, return true
        return of(true);
      }),
    );
  }
}
