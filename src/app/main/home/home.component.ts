import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { HomeAnimations } from './home.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { WEEKLYGOAL_DB } from 'src/app/core/store/weekly-goal/weekly-goal.mock';
import { WeeklyGoalsItemComponent } from './weekly-goals/weekly-goals-item/weekly-goals-item.component';
import { HASHTAG_DB } from 'src/app/core/store/hashtag/hashtag.mock';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: HomeAnimations,
  imports: [
    NavbarComponent, 
    WeeklyGoalsItemComponent,
  ]
})
export class HomeComponent implements OnInit {
  authStore = inject(AuthStore);
  
// --------------- INPUTS AND OUTPUTS ------------------

  /** The currently signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  
  curr_goal = (() => {
    // 1. Find the raw goal item from the database array
    const rawGoal = WEEKLYGOAL_DB.find(g => g.text === 'Apply to Microsoft');
    if (!rawGoal) return null;

    // 2. Look up the matching hashtag record from HASHTAG_DB using the goal's ID
    const matchingHashtag = HASHTAG_DB.find(h => h.__id === rawGoal.__hashtagId);

    // 3. Return the fully formed WeeklyGoalData object
    return {
      ...rawGoal,
      hashtag: matchingHashtag
    };
  })();
  
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
