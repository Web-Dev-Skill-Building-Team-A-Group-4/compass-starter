import { Component, OnInit, ChangeDetectionStrategy, WritableSignal, Signal, signal, computed, inject, Inject} from '@angular/core';
import { LongTermGoalsAnimations } from './long-term-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { LongTermGoalsHeaderComponent } from './long-term-goals-header/long-term-goals-header.component';
import { LongTermGoalsModalComponent } from './long-term-goals-modal/long-term-goals-modal.component';
import { LongTermGoalsItemComponent } from './long-term-goals-item/long-term-goals-item.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LongTermGoal } from 'src/app/core/store/long-term-goal/long-term-goal.model';
import { LongTermGoalStore } from '../../../core/store/long-term-goal/long-term-goal.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
@Component({
  selector: 'app-long-term-goals',
  templateUrl: './long-term-goals.component.html',
  styleUrls: ['./long-term-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsAnimations,
  standalone: true,
  imports: [ 
    LongTermGoalsHeaderComponent,
    LongTermGoalsModalComponent,    
    LongTermGoalsItemComponent,
  ],
})
export class LongTermGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly longTermGoalStore = inject(LongTermGoalStore);
  
  // --------------- INPUTS AND OUTPUTS ------------------
  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------
  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** For storing the dialogRef in the opened modal. */
  dialogRef?: MatDialogRef<LongTermGoalsModalComponent>;

  /** The current user's long-term goals. */
  longTermGoals: Signal<LongTermGoal | undefined> = computed(() => {
    return this.longTermGoalStore.selectFirst([['__userId', '==', this.currentUser()?.__id]], {});
  });

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  /** Opens the long-term goals modal for viewing or editing the current user's goals. */
  openModal(editClicked: boolean) : void {
    const goal = this.longTermGoals();
    if (!goal) {
      console.error('No long-term goal was found.');
      return;
    }
    this.dialogRef = this.dialog.open(LongTermGoalsModalComponent, {
      height: '90%',
      width: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: { 
        goals: goal,
        updateGoal: async (result:{
          oneYear: string;
          fiveYear: string;
        }) => {
          await this.updateGoal(goal, result);
          this.dialogRef?.close();
        },
      },
    });
  }
  /** Updates the long-term goal. */
  async updateGoal(
    goal: LongTermGoal,
    result: {
      oneYear: string;
      fiveYear: string;
    },
  ) {
    try {
      await this.longTermGoalStore.update(
        goal.__id,
        {
          oneYear: result.oneYear ?? '',
          fiveYear: result.fiveYear ?? '',
        },
        {
          optimistic: true,
          loading: this.loading,
          snackBarConfig: {
            successMessage: 'Long-term goals successfully updated',
            failureMessage: 'Failed to update long-term goals',
            undoOnAction: true,
            config: {
              duration: 3000,
              verticalPosition: 'bottom',
              horizontalPosition: 'center',
            },
          },
        },
      );
    } catch (e) {
    console.error(e);
    }
  }
  // --------------- OTHER -------------------------------
  constructor(
    private dialog: MatDialog,
    @Inject(BATCH_WRITE_SERVICE) private readonly batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  ngOnInit() {
      this.longTermGoalStore.load([['__userId', '==', this.currentUser()?.__id]], {});
  }
}