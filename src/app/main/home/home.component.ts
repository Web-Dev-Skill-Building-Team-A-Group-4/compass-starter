import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { HomeAnimations } from './home.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { NavbarComponent } from 'src/app/shared/navbar/navbar.component';
import { WEEKLYGOAL_DB } from 'src/app/core/store/weekly-goal/weekly-goal.mock';
import { WeeklyGoalsItemComponent } from './weekly-goals/weekly-goals-item/weekly-goals-item.component';
import { HASHTAG_DB } from 'src/app/core/store/hashtag/hashtag.mock';
import { QuarterlyGoalsComponent } from './quarterly-goals/quarterly-goals.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  animations: HomeAnimations,
  imports: [
    NavbarComponent, 
    QuarterlyGoalsComponent
  ]
})
export class HomeComponent implements OnInit {
  authStore = inject(AuthStore);
  
// --------------- INPUTS AND OUTPUTS ------------------

  /** The currently signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  
  curr_goal = (() => {
    const rawGoalForExample = WEEKLYGOAL_DB.find(g => g.text === 'Apply to Microsoft');
    if (!rawGoalForExample) return null;
    const matchingHashtag = HASHTAG_DB.find(h => h.__id === rawGoalForExample.__hashtagId);

  return {
      __id: rawGoalForExample.__id,
      __userId: rawGoalForExample.__userId,
      __quarterlyGoalId: rawGoalForExample.__quarterlyGoalId,
      __hashtagId: rawGoalForExample.__hashtagId,
      text: rawGoalForExample.text,
      order: rawGoalForExample.order,
      completed: rawGoalForExample.completed,
      _createdAt: rawGoalForExample._createdAt,
      _updatedAt: rawGoalForExample._updatedAt,
      _deleted: rawGoalForExample._deleted,
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
