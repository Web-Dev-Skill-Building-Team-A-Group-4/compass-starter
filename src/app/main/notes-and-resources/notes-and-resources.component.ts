import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { NotesAndResourcesAnimations } from './notes-and-resources.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlyGoalsSidebarComponent } from './quarterly-goals-sidebar/quarterly-goals-sidebar.component';
import { QuarterlyGoalStore } from '../../core/store/quarterly-goal/quarterly-goal.store';
import { QuarterlyGoal } from '../../core/store/quarterly-goal/quarterly-goal.model';
import { WeeklyGoalStore } from '../../core/store/weekly-goal/weekly-goal.store';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-notes-and-resources',
  templateUrl: './notes-and-resources.component.html',
  styleUrls: ['./notes-and-resources.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: NotesAndResourcesAnimations,
  standalone: true,
  imports: [
    QuarterlyGoalsSidebarComponent,
  ],
})

export class NotesAndResourcesComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** 
   * Route parameter value representing what goal we're taking notes on.
   * IMPORTANT: This can be either an id for a long term goal or quarterly goal,
   * which will significantly impact the UI and your queries!
   */
  goalId: Signal<string> = input.required<string>();

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------
  /** Data for quarterly goals. */
  quarterlyGoal: Signal<QuarterlyGoal> = computed(() => {
    return this.quarterlyGoalStore.selectEntity(this.goalId());
  });

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
    // load quarterly goals   
    this.quarterlyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id],
      ['__id', '==', this.goalId()],
    ], {});

    // load weekly goals
    this.weeklyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id],
      ['__quarterlyGoalId', '==', this.goalId()],
    ], {});
  }
}
