import { Component, OnInit, ChangeDetectionStrategy, inject, Signal, Inject, Injector, computed } from '@angular/core';
import { OnboardWeeklyGoalsAnimations } from './onboard-weekly-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { WeeklyGoalStore } from 'src/app/core/store/weekly-goal/weekly-goal.store';
import { QuarterlyGoalStore } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectModule, MatSelectTrigger } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { QuarterlyGoalData } from 'src/app/main/home/home.model';

@Component({
  selector: 'app-onboard-weekly-goals',
  templateUrl: './onboard-weekly-goals.component.html',
  styleUrls: ['./onboard-weekly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: OnboardWeeklyGoalsAnimations,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatFormField,
    MatInput,
    MatIcon,
    MatSelect,
    MatSelectModule,
    MatSelectTrigger,
    MatOption,
    RouterLink,
  ],
})
export class OnboardWeeklyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly weeklyGoalStore = inject(WeeklyGoalStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** FormArray for weekly goals. */
  weeklyGoalsForm = this.fb.group({
    allGoals: this.fb.array([]),
  });

  get allGoals() {
    return this.weeklyGoalsForm.get('allGoals') as FormArray;
  }

  // --------------- COMPUTED DATA -----------------------

  /** Quarterly goals with hashtags for the dropdown. */
  quarterlyGoals = computed(() => {
    const qGoals = this.quarterlyGoalStore.selectEntities([
      ['__userId', '==', this.currentUser()?.__id],
      ['completed', '==', false],
    ], {});
    return qGoals.map((goal) => Object.assign({}, goal, {
      hashtag: this.hashtagStore.selectEntity(goal.__hashtagId),
    })) as QuarterlyGoalData[];
  });

  /** Get hashtag for a given quarterly goal ID */
  getHashtag(quarterlyGoalId: string) {
    if (!quarterlyGoalId) return null;
    const match = this.quarterlyGoals().find(g => g.__id === quarterlyGoalId);
    return match ? match.hashtag : null;
  }

  // --------------- EVENT HANDLING ----------------------

  addGoal() {
    this.allGoals.push(
      this.fb.group({
        text: ['', Validators.required],
        __quarterlyGoalId: [''],
        _deleted: [false],
        _new: [true],
      })
    );
  }

  removeGoal(i: number) {
    this.allGoals.removeAt(i);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.allGoals.controls, event.previousIndex, event.currentIndex);
    this.allGoals.updateValueAndValidity();
  }

  async save() {
    try {
      await this.batch.batchWrite(
        async (batchConfig) => {
          let i = 0;
          for (const control of this.allGoals.controls) {
            const val = control.value;
            if (!val._deleted && val.text) {
              await this.weeklyGoalStore.add(
                {
                  __userId: this.currentUser()?.__id,
                  __quarterlyGoalId: val.__quarterlyGoalId || null,
                  __hashtagId: this.quarterlyGoalStore.selectEntity(val.__quarterlyGoalId)?.__hashtagId || null,
                  text: val.text,
                  completed: false,
                  order: i,
                },
                { batchConfig }
              );
            }
            i++;
          }
        },
        {
          snackBarConfig: {
            successMessage: 'Weekly goals saved!',
            failureMessage: 'Could not save goals.',
            undoOnAction: false,
            config: { duration: 3000 },
          },
        },
      );
      this.router.navigate(['/home']);
    } catch (e) {
      console.error(e);
    }
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) {}

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
    this.quarterlyGoalStore.load(
      [['__userId', '==', this.currentUser()?.__id], ['completed', '==', false]],
      {},
      (quarterlyGoal) => [LoadHashtag.create(this.hashtagStore, [['__id', '==', quarterlyGoal.__hashtagId]], {})]
    );
    // Seed one blank row
    this.addGoal();
  }
}
