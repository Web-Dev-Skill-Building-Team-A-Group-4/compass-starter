import { Component, OnInit, ChangeDetectionStrategy, inject, WritableSignal, Signal, signal, Inject, Injector, computed } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { QuarterlyGoalsAnimations } from './quarterly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { QuarterlyGoalsHeaderComponent } from './quarterly-goals-header/quarterly-goals-header.component';
import { QuarterlyGoalsModalComponent } from './quarterly-goals-modal/quarterly-goals-modal.component';
import { QuarterlyGoalsItemComponent } from './quarterly-goals-item/quarterly-goals-item.component';
import { QUARTERLYGOAL_DB } from '../../../core/store/quarterly-goal/quarterly-goal.mock';
import { QuarterlyGoalData, WeeklyGoalData } from '../home.model';
import { Timestamp } from '@angular/fire/firestore';
import { QuarterlyGoalStore } from '../../../core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { Hashtag } from '../../../core/store/hashtag/hashtag.model';
import { WeeklyGoalStore, LoadWeeklyGoal } from '../../../core/store/weekly-goal/weekly-goal.store';
import { getQuarterAndYear, getStartAndEndDate } from 'src/app/core/utils/time.utils';
import { createId } from '../../../core/utils/rand.utils';

@Component({
  selector: 'app-quarterly-goals',
  templateUrl: './quarterly-goals.component.html',
  styleUrls: ['./quarterly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsAnimations,
  standalone: true,
  imports: [
    QuarterlyGoalsHeaderComponent,
    QuarterlyGoalsModalComponent,
    QuarterlyGoalsItemComponent,
  ],
})
export class QuarterlyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private dialog = inject(MatDialog);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------
  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** For storing the dialogRef in the opened modal. */
  dialogRef!: MatDialogRef<QuarterlyGoalsModalComponent>;

  /** Hashtag colors. */
  HASHTAG_COLORS = ['#EE8B72', '#2DBDB1', '#FFB987'];

  // --------------- COMPUTED DATA -----------------------

  getQuarterAndYear = getQuarterAndYear; 

  /** Data for incomplete weekly goals. */
  incompleteQuarterlyGoals: Signal<QuarterlyGoalData[]> = computed(() => {
    const incompleteGoals = this.quarterlyGoalStore.selectEntities(
      [
        ['__userId', '==', this.currentUser()?.__id],
        ['completed', '==', false],
      ],
      { orderBy: 'order' },
    );

    return incompleteGoals.map((goal) => {
      return Object.assign({}, goal, {
        hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
        weeklyGoalsTotal: this.weeklyGoalStore.selectEntities([
          ['__quarterlyGoalId', '==', goal.__id],
        ], {}).length,
        weeklyGoalsComplete: this.weeklyGoalStore.selectEntities([
          ['__quarterlyGoalId', '==', goal.__id],
          ['completed', '==', true],
        ], {}).length,
      });
    });
  });

  /** Data for completed weekly goals. */
  completeQuarterlyGoals: Signal<QuarterlyGoalData[]> = computed(() => {
    const quarterStartDate = getStartAndEndDate()[0];
    const completeGoals = this.quarterlyGoalStore.selectEntities(
      [
        ['__userId', '==', this.currentUser()?.__id],
        ['completed', '==', true],
        ['endDate', '>=', Timestamp.fromDate(quarterStartDate)],
      ],
      { orderBy: 'order' },
    );

    return completeGoals.map((goal) => {
      return Object.assign({}, goal, {
        hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
        weeklyGoalsTotal: this.weeklyGoalStore.selectEntities([
          ['__quarterlyGoalId', '==', goal.__id],
        ], {}).length,
        weeklyGoalsComplete: this.weeklyGoalStore.selectEntities([
          ['__quarterlyGoalId', '==', goal.__id],
          ['completed', '==', true],
        ], {}).length,
      });
    });
  });
  
  hashtags: Signal<Hashtag[]> = computed(() => {
    return this.hashtagStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id]
    ], {});
  });

  // --------------- EVENT HANDLING ----------------------
  
  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(QuarterlyGoalsModalComponent, {
      height: '90%',
      width: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: {
        goals: this.incompleteQuarterlyGoals(),
        hashtags: this.hashtags(),
        updateQuarterlyGoals: async (quarterlyGoalsFormArray) => {
          try {
            this.batch.batchWrite(
              async (batchConfig) => {
                await Promise.all(
                  quarterlyGoalsFormArray.controls.map(async (control, i) => {
                    // if this is a new quarter goal
                    if (!control.value.__id) {
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

  /** Update quarterly goal. */
  async checkGoal(goal: QuarterlyGoalData) {
    try {
      await this.quarterlyGoalStore.update(
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

  async addNewGoal(controlValue, i, batchConfig) {
    // Add a hashtag 
    const hashtagId = createId();
    await this.hashtagStore.add(
      Object.assign({}, {
        __userId: this.currentUser()?.__id,
        __id: hashtagId,
        name: controlValue.hashtagName,
        color: this.HASHTAG_COLORS[i % this.HASHTAG_COLORS.length],
      }), { batchConfig }
    );
    
    // Add a quarterly goal
    await this.quarterlyGoalStore.add(
      Object.assign({}, {
        __userId: this.currentUser()?.__id,
        text: controlValue.text,
        __hashtagId: hashtagId,
        completed: false,
        order: i + 1,
        _deleted: controlValue._deleted,
      }), { batchConfig }
    );
  }

  /** Removes some goal based off form values */
  async removeGoal(controlValue, batchConfig) {
    await this.quarterlyGoalStore.remove(controlValue.__id, {
      batchConfig,
    });
  }
  
  /** Updates some goal based off form values */
  async updateGoal(controlValue, i, batchConfig) {
    await this.quarterlyGoalStore.update(
      controlValue.__id,
      Object.assign({}, {
        text: controlValue.text,
        __hashtagId: controlValue.__hashtagId,
        order: i + 1,
        _deleted: controlValue._deleted,
      }), { batchConfig },
    );

    await this.hashtagStore.update(controlValue.__hashtagId, {
      name: controlValue.hashtagName,
      color: controlValue.hashtagColor,
    }, { batchConfig });
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
    //load incomplete quarterly goals
    this.quarterlyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id], 
      ['completed', '==', false],
    ], { orderBy: 'order' }, (quarterlyGoal) => [
      LoadHashtag.create(this.hashtagStore, [['__id', '==', quarterlyGoal.__hashtagId]], {}),
      LoadWeeklyGoal.create(this.weeklyGoalStore, [['__quarterlyGoalId', '==', quarterlyGoal.__id]], {}),
    ]);

    //load completed quarterly goals
    this.quarterlyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id], 
      ['completed', '==', true],
      ['endDate', '>=', Timestamp.fromDate(getStartAndEndDate()[0])],
    ], { orderBy: 'order' }, (quarterlyGoal) => [
      LoadHashtag.create(this.hashtagStore, [['__id', '==', quarterlyGoal.__hashtagId]], {}),
      LoadWeeklyGoal.create(this.weeklyGoalStore, [['__quarterlyGoalId', '==', quarterlyGoal.__id]], {}),
    ]);
  }
}
