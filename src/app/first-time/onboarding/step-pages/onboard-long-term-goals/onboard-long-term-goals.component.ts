import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, WritableSignal, Signal, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OnboardLongTermGoalsAnimations } from './onboard-long-term-goals.animations';
import { OnboardingState, User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { UserStore } from 'src/app/core/store/user/user.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-onboard-long-term-goals',
  templateUrl: './onboard-long-term-goals.component.html',
  styleUrls: ['./onboard-long-term-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: OnboardLongTermGoalsAnimations,
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
})
export class OnboardLongTermGoalsComponent implements OnInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** One year goal input value. */
  oneYearGoal: WritableSignal<string> = signal('');

  /** Five year goal input value. */
  fiveYearGoal: WritableSignal<string> = signal('');

  // --------------- COMPUTED DATA -----------------------

  /** True when viewport is mobile width — updates on resize. */
  isMobile: WritableSignal<boolean> = signal(window.innerWidth <= 768);

  /** Placeholder for the 1 year goal input. */
  onePlaceholder: Signal<string> = computed(() =>
    this.isMobile() ? 'Type something...' : 'Secure SWE or UX Engineering Internship'
  );

  /** Placeholder for the 5 year goal textarea. */
  fivePlaceholder: Signal<string> = computed(() =>
    this.isMobile() ? 'Type something...' : 'Working as a SWE in a team I love with some UX/Design oriented work'
  );

  /** True only when both goal fields have content. */
  canProceed: Signal<boolean> = computed(() =>
    this.oneYearGoal().trim().length > 0 && this.fiveYearGoal().trim().length > 0
  );

  // --------------- EVENT HANDLING ----------------------
 /**Navigates to Initial page */
  onBack() {
    this.userStore.update(this.currentUser().__id, {
      onboardingState: OnboardingState.WELCOME,
    });
  }
 
  /**Navigates to Nice Work page */
  onNext() {
    this.userStore.update(this.currentUser().__id, {
      onboardingState: OnboardingState.STEP_2,
      oneYearGoal: this.oneYearGoal(),
      fiveYearGoal: this.fiveYearGoal(),
    } as any);
  }

  // --------------- OTHER -------------------------------
  /** Tracks window width on resize to update isMobile. */
  private resizeListener = () => {
    this.isMobile.set(window.innerWidth <= 768);
  };

  // --------------- LOAD AND CLEANUP --------------------
  /** Starts listening for window resize when the component loads. */
  ngOnInit(): void {
    window.addEventListener('resize', this.resizeListener);
  }
  
  /** Stops listening for window resize when the component is removed. */
  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }
}