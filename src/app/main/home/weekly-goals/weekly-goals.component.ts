import { ChangeDetectionStrategy, Component, computed, inject, Inject, Injector, OnInit, Signal } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { User } from 'src/app/core/store/user/user.model';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { WeeklyGoalStore } from 'src/app/core/store/weekly-goal/weekly-goal.store';
import { QuarterlyGoalStore } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { getStartWeekDate, startOfWeek, endOfWeek } from 'src/app/core/utils/time.utils';
import { WeeklyGoalsAnimations } from './weekly-goals.animations';
import { WeeklyGoalsHeaderComponent } from './weekly-goals-header/weekly-goals-header.component';
import { WeeklyGoalsItemComponent } from './weekly-goals-item/weekly-goals-item.component';
import { WeeklyGoalsModalComponent } from './weekly-goals-modal/weekly-goals-modal.component';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-weekly-goals',
  templateUrl: './weekly-goals.component.html',
  styleUrls: ['./weekly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsAnimations,
  standalone: true,
  imports: [
    WeeklyGoalsHeaderComponent,
    WeeklyGoalsItemComponent,
  ],
})
export class WeeklyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed-in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Stores the reference to the opened modal. */
  dialogRef!: MatDialogRef<WeeklyGoalsModalComponent>;

  // --------------- COMPUTED DATA -----------------------

  getStartWeekDate = getStartWeekDate;

  incompleteWeeklyGoals = computed(() => {
    const incompleteGoals = this.weeklyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['completed', '==', false],
    ], { orderBy: 'order' });

    return incompleteGoals.map((goal) => Object.assign({}, goal, {
      hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
    }));
  });

  completeWeeklyGoals = computed(() => {
    const startOfWeek = Timestamp.fromDate(this.getStartWeekDate());
    const completeGoals = this.weeklyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['completed', '==', true],
      ['completionDate', '>=', startOfWeek]
    ], { orderBy: 'order' });

    return completeGoals.map((goal) => Object.assign({}, goal, {
      hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
    }));
  });

  quarterlyGoals = computed(() => {
    const qGoals = this.quarterlyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['completed', '==', false]
    ], {});

    return qGoals.map((goal) => Object.assign({}, goal, {
      hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
    }));
  });

  // --------------- EVENT HANDLING ----------------------

  /** Handles Open Modal event */
  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(WeeklyGoalsModalComponent, {
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      width: '90%',
      height: '90%',
      injector: this.injector,
      data: {
        startOfWeek: startOfWeek,
        endOfWeek: endOfWeek,
        goals: [...this.incompleteWeeklyGoals(), ...this.completeWeeklyGoals()].map(({ hashtag, ...goal }) => goal),
        quarterlyGoals: this.quarterlyGoals(),
        updateWeeklyGoals: async (weeklyGoalsFormArray: FormArray) => {
          try {
            await this.batch.batchWrite(
              async (batchConfig) => {
                let i = 0;
                for (const control of weeklyGoalsFormArray.controls) {
                  if (control.value._deleted && control.value.__weeklyGoalId) {
                    await this.removeGoal(control.value, batchConfig);
                  } else if (!control.value.__weeklyGoalId) {
                    if (!control.value._deleted) {
                      await this.addNewGoal(control.value, i, batchConfig);
                    }
                  } else {
                    await this.updateGoal(control.value, i, batchConfig);
                  }
                  i++;
                }

              },
              {
                snackBarConfig: {
                  successMessage: 'Goals successfully updated',
                  failureMessage: 'Goal not added successfully',
                  undoOnAction: true,
                  config: { duration: 5000 },
                },
              },
            );
            this.dialogRef.close();
          } catch (e) {
            console.error(e);
          }
        },
      },
    });
  }

  /** Code to add new goal */
  async addNewGoal(controlValue, i: number, batchConfig) {
    const selectedQuarterlyGoal = this.quarterlyGoalStore.selectEntity(controlValue.__quarterlyGoalId);

    await this.weeklyGoalStore.add(
      {
        __userId: this.currentUser()?.__id,
        __quarterlyGoalId: controlValue.__quarterlyGoalId,
        __hashtagId: selectedQuarterlyGoal?.__hashtagId || null,
        text: controlValue.text,
        completed: false,
        order: i,
      },
      { batchConfig }
    );
  }

  /** Code to remove a goal */
  async removeGoal(controlValue, batchConfig) {
    await this.weeklyGoalStore.remove(
      controlValue.__weeklyGoalId,
      { batchConfig }
    );
  }

  /** Code to update a goal */
  async updateGoal(controlValue, i: number, batchConfig) {
    // Look up the selected Quarterly Goal to get its hashtag ID
    const selectedQuarterlyGoal = this.quarterlyGoalStore.selectEntity(controlValue.__quarterlyGoalId);

    await this.weeklyGoalStore.update(
      controlValue.__weeklyGoalId,
      {
        text: controlValue.text,
        __quarterlyGoalId: controlValue.__quarterlyGoalId,
        __hashtagId: selectedQuarterlyGoal?.__hashtagId || null,
        order: i,
      },
      { batchConfig }
    );
  }


  /** Handles a completion toggle emitted from a weekly-goals-item. */
  onGoalToggled(event: { __id: string; completed: boolean }): void {
    this.weeklyGoalStore.update(event.__id, {
      completed: event.completed,
      completionDate: event.completed ? Timestamp.now() : null,
    });
  }
  // --------------- OTHER -------------------------------
  constructor(
    private readonly dialog: MatDialog,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE)
    private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit() {
    const startOfWeek = Timestamp.fromDate(this.getStartWeekDate());
    this.weeklyGoalStore.load(
      [['__userId', '==', this.currentUser()?.__id], ['completed', '==', false]],
      {},
      (weeklyGoal) => [LoadHashtag.create(this.hashtagStore, [['__id', '==', weeklyGoal.__hashtagId]], {})]
    );
    this.weeklyGoalStore.load(
      [['__userId', '==', this.currentUser()?.__id], ['completed', '==', true], ['completionDate', '>=', startOfWeek]],
      {},
      (weeklyGoal) => [LoadHashtag.create(this.hashtagStore, [['__id', '==', weeklyGoal.__hashtagId]], {})]
    );
    this.quarterlyGoalStore.load(
      [['__userId', '==', this.currentUser()?.__id], ['completed', '==', false]],
      {},
      (quarterlyGoal) => [LoadHashtag.create(this.hashtagStore, [['__id', '==', quarterlyGoal.__hashtagId]], {})]
    );
  }
}