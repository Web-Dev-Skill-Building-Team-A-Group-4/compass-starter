import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsSidebarAnimations } from './quarterly-goals-sidebar.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { WeeklyGoalData, QuarterlyGoalData } from '../../home/home.model';
import { WeeklyGoalStore } from '../../../core/store/weekly-goal/weekly-goal.store';
import { QuarterlyGoalStore } from '../../../core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from '../../../core/store/hashtag/hashtag.store';
import { QuarterlyGoal } from '../../../core/store/quarterly-goal/quarterly-goal.model';
import { MatDividerModule } from '@angular/material/divider';
import { Timestamp } from '@angular/fire/firestore';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { WeeklyGoalsModalComponent } from '../../home/weekly-goals/weekly-goals-modal/weekly-goals-modal.component';
import { QuarterlySidebarItemComponent } from './quarterly-sidebar-item/quarterly-sidebar-item.component';

@Component({
  selector: 'app-quarterly-goals-sidebar',
  templateUrl: './quarterly-goals-sidebar.component.html',
  styleUrls: ['./quarterly-goals-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsSidebarAnimations,
  standalone: true,
  imports: [
    MatDividerModule,
    WeeklyGoalsModalComponent,
    QuarterlySidebarItemComponent,
  ],
})
export class QuarterlyGoalsSidebarComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  quarterlyGoal = input.required<QuarterlyGoal>();

  // --------------- LOCAL UI STATE ----------------------

  /** For storing the dialogRef in the opened modal. */
  dialogRef: MatDialogRef<WeeklyGoalsModalComponent>;

  // --------------- COMPUTED DATA -----------------------

  /** Data for incomplete weekly goals. */
  incompleteWeeklyGoals: Signal<WeeklyGoalData[]> = computed(() => {
    const incompleteGoals = this.weeklyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['__quarterlyGoalId', '==', this.quarterlyGoal().__id],
      ['completed', '==', false],
    ], { orderBy: 'order' });

    return incompleteGoals.map((goal) => {
      // get the quarter goal associated with that weekly goal to make updates easier
      const quarterGoal = this.quarterlyGoalStore.selectEntity(goal.__quarterlyGoalId);
      return Object.assign({}, goal, {
        hashtag: this.hashtagStore.selectEntity(quarterGoal?.__hashtagId),
        quarterGoal: quarterGoal,
      });
    });
  });

  /** Data for complete weekly goals. */
  completeWeeklyGoals: Signal<WeeklyGoalData[]> = computed(() => {
    const completeGoals = this.weeklyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['__quarterlyGoalId', '==', this.quarterlyGoal().__id],
      ['completed', '==', true],
    ], { orderBy: 'order' });

    return completeGoals.map((goal) => {
      // get the quarter goal associated with that weekly goal to make updates easier
      const quarterGoal = this.quarterlyGoalStore.selectEntity(goal.__quarterlyGoalId);
      return Object.assign({}, goal, {
        hashtag: this.hashtagStore.selectEntity(quarterGoal?.__hashtagId),
        quarterGoal: quarterGoal,
      });
    });
  });

  /** All quarterly goals, needed for weekly goals modal */
  quarterlyGoals: Signal<Partial<QuarterlyGoalData>[]> = computed(() => {
    const allGoals = this.quarterlyGoalStore.selectEntities(
      [['__userId', '==', this.currentUser()?.__id]],
      { orderBy: 'order' },
    );

    return allGoals.map((goal) => {
      return Object.assign({}, goal, {
        hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
      });
    });
  });

  // --------------- EVENT HANDLING ----------------------

  /** Open weekly goals modal. */
  /** Update weekly goals. */
  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(WeeklyGoalsModalComponent, {
      height: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: {
        goalDatas: this.quarterlyGoals(),
        incompleteGoals: this.incompleteWeeklyGoals(),
        updateWeeklyGoals: async (weeklyGoalsFormArray) => {
          try {
            this.batch.batchWrite(
              async (batchConfig) => {
                await Promise.all(
                  weeklyGoalsFormArray.controls.map(async (control, i) => {
                    // if this is a new quarter goal
                    if (!control.value.__weeklyGoalId) {
                      await this.addNewGoal(control.value, i, batchConfig);
                      // if it's a goal that's getting deleted
                    } else if (control.value._deleted) {
                      await this.removeGoal(control.value, batchConfig);
                      // if it's a goal that's getting updated
                    } else {
                      await this.updateGoal(control.value, i, batchConfig);
                    }
                  }),
                );
              },
              {
                snackBarConfig: {
                  successMessage: 'Goals successfully updated',
                  failureMessage: 'Goal not added successfully',
                  undoOnAction: true,
                  config: { duration: 3000 },
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

  /** Update weekly goal. */
  async checkGoal(goal: WeeklyGoalData) {
    try {
      await this.weeklyGoalStore.update(
        goal.__id,
        {
          completed: !goal.completed,
          ...(!goal.completed ? { endDate: Timestamp.now() } : {}),
        },
        {
          optimistic: true,
          snackBarConfig: {
            successMessage: 'Marked goal as ' + (goal.completed ? 'incomplete' : 'complete'),
            failureMessage: 'Failed to update goal',
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

  /** Adds a goal based off form values */
  async addNewGoal(controlValue, i, batchConfig) {
    // Add a quarterly goal
    await this.weeklyGoalStore.add(
      Object.assign(
        {},
        {
          __userId: this.currentUser()?.__id,
          __quarterlyGoalId: controlValue.__quarterlyGoalId,
          text: controlValue.text,
          completed: false,
          order: i + 1,
          _deleted: controlValue._deleted,
        },
      ),
      { batchConfig },
    );
  }

  /** Removes some goal based off form values */
  async removeGoal(controlValue, batchConfig) {
    await this.weeklyGoalStore.remove(controlValue.__weeklyGoalId, {
      batchConfig,
    });
  }

  /** Updates some goal based off form values */
  async updateGoal(controlValue, i, batchConfig) {
    await this.weeklyGoalStore.update(
      controlValue.__weeklyGoalId,
      Object.assign({},
        {
          __quarterlyGoalId: controlValue.__quarterlyGoalId,
          text: controlValue.text,
          order: i + 1,
          _deleted: controlValue._deleted,
        },
      ),
      { batchConfig },
    );
  }

  // --------------- OTHER -------------------------------

  constructor(
    private dialog: MatDialog,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
    // load all quarterly goals
    this.quarterlyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id],
    ], {}, (qg) => [
      LoadHashtag.create(this.hashtagStore, [['__id', '==', qg.__hashtagId]], {}),
    ]);
  }
}
