import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsAnimations } from './quarterly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlyGoalsItemComponent } from './quarterly-goals-item/quarterly-goals-item.component';
import { QUARTERLYGOAL_DB } from '../../../core/store/quarterly-goal/quarterly-goal.mock';
import { QuarterlyGoal } from '../../../core/store/quarterly-goal/quarterly-goal.model';
import { QuarterlyGoalData } from '../home.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-quarterly-goals',
  templateUrl: './quarterly-goals.component.html',
  styleUrls: ['./quarterly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsAnimations,
  standalone: true,
  imports: [
    QuarterlyGoalsItemComponent,
  ],
})
export class QuarterlyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  quarterlyGoals = signal(QUARTERLYGOAL_DB);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  sampleData: QuarterlyGoalData = {
    __id: 'qg2',
    __userId: 'test-user',
    __hashtagId: 'ht1',
    text: 'Apply to all internships',
    completed: false,
    order: 2,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
    hashtag: {
      __id: 'ht1',
      __userId: 'test-user',
      name: 'apply-internships',
      color: '#EE8B72',
      _createdAt: Timestamp.now(),
      _updatedAt: Timestamp.now(),
      _deleted: false,
    },
    weeklyGoalsTotal: 3,
    weeklyGoalsComplete: 2,
  };

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
