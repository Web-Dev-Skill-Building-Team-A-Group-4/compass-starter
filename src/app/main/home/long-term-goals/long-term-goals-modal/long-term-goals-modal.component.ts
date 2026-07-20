import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { LongTermGoalsModalAnimations } from './long-term-goals-modal.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LongTermGoal } from 'src/app/core/store/long-term-goal/long-term-goal.model';

@Component({
  selector: 'app-long-term-goals-modal',
  templateUrl: './long-term-goals-modal.component.html',
  styleUrls: ['./long-term-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsModalAnimations,
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    ReactiveFormsModule,
  ],
})
export class LongTermGoalsModalComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);
  /** one year goal value received from parent component */
  oneYearGoal = new FormControl(''); 
  /** five year goal value received from parent component */
  fiveYearGoal = new FormControl('');

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  /** function closes the modal when the X is clicked. */
  onClose() {
    this.dialogRef.close();
  }

  /** function supposedly saves changes made from editing goals */
  save(){
    this.dialogRef.close({
      ...this.data,
      oneYear: this.oneYearGoal.value,
      fiveYear: this.fiveYearGoal.value,
    });
  }

  // --------------- OTHER -------------------------------

  constructor(
    private dialogRef: MatDialogRef<LongTermGoalsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {goals: LongTermGoal},
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
    this.oneYearGoal.setValue(this.data.goals.oneYear);
    this.fiveYearGoal.setValue(this.data.goals.fiveYear);
  }
}
