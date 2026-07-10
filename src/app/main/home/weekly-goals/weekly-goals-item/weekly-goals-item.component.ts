import { Component, OnInit, ChangeDetectionStrategy, input, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { WeeklyGoalsItemAnimations } from './weekly-goals-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { WeeklyGoal } from '../../../../core/store/weekly-goal/weekly-goal.model';
import { Hashtag } from '../../../../core/store/hashtag/hashtag.model';

export interface WeeklyGoalData extends WeeklyGoal {
  hashtag: Hashtag;
}

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
  // --------------- INPUTS AND OUTPUTS ------------------
  

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

    /** goal object from parent */
  goal = input.required<WeeklyGoalData>();
  
  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** title of goal item */
  text = computed(() => this.goal().text);

  /** Whether goal is checked/complete */
  completed = computed(() => this.goal().completed);
  
  /** The hashtag associated with goal */
  hashtag = computed(() => {
    const name = this.goal().hashtag?.name;
    return name ? '#' + name : '';
  });
  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
