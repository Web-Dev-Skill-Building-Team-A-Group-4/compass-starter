import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsItemAnimations } from './quarterly-goals-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuarterlyGoalData } from '../../home.model';

@Component({
  selector: 'app-quarterly-goals-item',
  templateUrl: './quarterly-goals-item.component.html',
  styleUrls: ['./quarterly-goals-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsItemAnimations,
  standalone: true,
  imports: [
    MatCheckboxModule,
  ],
})
export class QuarterlyGoalsItemComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** goal object from parent */
  goal = input<QuarterlyGoalData>();

  // --------------- COMPUTED DATA -----------------------

  /** Whether goal is checked/complete */
  completed = computed(() => this.goal().completed);

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
