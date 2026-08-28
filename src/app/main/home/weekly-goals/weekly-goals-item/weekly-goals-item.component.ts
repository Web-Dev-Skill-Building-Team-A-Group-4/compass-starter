import { Component, OnInit, ChangeDetectionStrategy, input, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { WeeklyGoalsItemAnimations } from './weekly-goals-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { WeeklyGoal } from '../../../../core/store/weekly-goal/weekly-goal.model';
import { Hashtag } from '../../../../core/store/hashtag/hashtag.model';
import { WeeklyGoalStore } from '../../../../core/store/weekly-goal/weekly-goal.store';
import { output } from '@angular/core';
import { WeeklyGoalData } from '../../home.model';

@Component({
  selector: 'app-weekly-goals-item',
  templateUrl: './weekly-goals-item.component.html',
  styleUrls: ['./weekly-goals-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsItemAnimations,
  standalone: true,
  imports: [MatCheckboxModule
  ],
})
export class WeeklyGoalsItemComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  /** goal object from parent */
  goal = input.required<WeeklyGoalData>();

  /** Emits when the user toggles this goal's completion state. */
  toggled = output<{ __id: string; completed: boolean }>();
  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  // --------------- COMPUTED DATA -----------------------
  /** The hashtag associated with goal */
  hashtag = computed(() => {
    const name = this.goal().hashtag?.name;
    return name ? '#' + name : '';
  });

  /** title of goal item */
  text = computed(() => this.goal().text);

  /** Whether goal is checked/complete */
  completed = computed(() => this.goal().completed);

  /** The color of the hashtag associated with goal */
  hashtagColor = computed(() => this.goal().hashtag?.color ?? '#5A5A5A');

  // --------------- EVENT HANDLING ----------------------

  /** Requests toggling current goal completion state */
  toggleGoal(): void {
    const goalData = this.goal();
    this.toggled.emit({ __id: goalData.__id, completed: !goalData.completed });
  }
  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }
  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
  }
}
