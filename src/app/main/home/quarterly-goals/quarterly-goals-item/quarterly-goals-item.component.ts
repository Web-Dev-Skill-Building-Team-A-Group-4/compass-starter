import { Component, OnInit, ChangeDetectionStrategy, OutputEmitterRef, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsItemAnimations } from './quarterly-goals-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { QuarterlyGoalData } from '../../home.model';
import { MatDividerModule } from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';

@Component({
  selector: 'app-quarterly-goals-item',
  templateUrl: './quarterly-goals-item.component.html',
  styleUrls: ['./quarterly-goals-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsItemAnimations,
  standalone: true,
  imports: [
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
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
  goal: Signal<QuarterlyGoalData> = input<QuarterlyGoalData>();
  checked: OutputEmitterRef<QuarterlyGoalData> = output<QuarterlyGoalData>();

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  checkGoal() {
    this.checked.emit(this.goal());
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
