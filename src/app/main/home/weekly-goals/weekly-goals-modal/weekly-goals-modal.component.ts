import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { WeeklyGoalsModalAnimations } from './weekly-goals-modal.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { WeeklyGoal } from 'src/app/core/store/weekly-goal/weekly-goal.model';
import { WEEKLYGOAL_DB } from 'src/app/core/store/weekly-goal/weekly-goal.mock';
import { HASHTAG_DB } from 'src/app/core/store/hashtag/hashtag.mock';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { QuarterlyGoalData, WeeklyGoalInForm } from '../../home.model';
import { endOfWeek, startOfWeek } from 'src/app/core/utils/time.utils';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-weekly-goals-modal',
  templateUrl: './weekly-goals-modal.component.html',
  styleUrls: ['./weekly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsModalAnimations,
  standalone: true,
  imports: [ MatIconButton,
             MatIcon,
             MatFormField,
             MatInput,
             MatSelect,
             MatOption,
             CdkDrag,
             CdkDragHandle,
             CdkDropList,
  ],
})
export class WeeklyGoalsModalComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;
    
  onClose() {
    this.dialogRef.close();
  }

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** weekly goal from mock.ts file. */
  task = signal<WeeklyGoal[]>(structuredClone(WEEKLYGOAL_DB));
  
  /** hashtag from mock.ts file. */
  htg: Hashtag[] = HASHTAG_DB;

  /** hashtag map that maps WEEKLYGOAL_DB to HASHTAG_DB based on id */
  htgIdMap = Object.fromEntries(
    this.htg.map((h) => [h.__id, h]),
  );

  // --------------- COMPUTED DATA -----------------------
  
  endOfWeek = endOfWeek; // import from time.utils.ts
  startOfWeek = startOfWeek; // import from time.utils.ts

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  /** Support drag and drop of goals. */
  drop(event: CdkDragDrop<WeeklyGoal[]>) {
    this.task.update((tasks) => {
    moveItemInArray(
      tasks,
      event.previousIndex,
      event.currentIndex,
    );
    return tasks;
    });
  }

  save() {
    console.log(this.task());
  }
  
  constructor(
    private dialogRef: MatDialogRef<WeeklyGoalsModalComponent>,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
