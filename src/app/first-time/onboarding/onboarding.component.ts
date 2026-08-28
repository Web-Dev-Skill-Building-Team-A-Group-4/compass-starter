import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, Inject, Injector } from '@angular/core';
import { OnboardingAnimations } from './onboarding.animations';
import { User, OnboardingState } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { InitialPageComponent } from './step-pages/initial-page/initial-page.component';
import { OnboardLongTermGoalsComponent } from './step-pages/onboard-long-term-goals/onboard-long-term-goals.component';
import { OnboardLongTermTransitionComponent } from './step-pages/onboard-long-term-transition/onboard-long-term-transition.component';
import { OnboardQuarterlyGoalsComponent } from './step-pages/onboard-quarterly-goals/onboard-quarterly-goals.component';
import { OrganizeQuarterlyGoalsComponent } from './step-pages/organize-quarterly-goals/organize-quarterly-goals.component';
import { OnboardWeeklyGoalsComponent } from './step-pages/onboard-weekly-goals/onboard-weekly-goals.component';
import { FinalPageComponent } from './step-pages/final-page/final-page.component';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: OnboardingAnimations,
  imports: [
    InitialPageComponent,
    OnboardLongTermGoalsComponent,
    OnboardLongTermTransitionComponent,
    OnboardQuarterlyGoalsComponent,
    OrganizeQuarterlyGoalsComponent,
    OnboardWeeklyGoalsComponent,
    FinalPageComponent,
  ],
})
export class OnboardingComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly OnboardingState = OnboardingState;

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The currently signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) {
  }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit() {
  }
}
