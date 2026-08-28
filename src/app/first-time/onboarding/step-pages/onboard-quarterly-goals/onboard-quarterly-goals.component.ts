import { Component, OnInit, ChangeDetectionStrategy, output, inject, WritableSignal, Signal, signal, Inject, Injector } from '@angular/core';
import { OnboardQuarterlyGoalsAnimations } from './onboard-quarterly-goals.animations';
import { User, OnboardingState } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { QuarterlyGoalStore } from 'src/app/core/store/quarterly-goal/quarterly-goal.store';
import { HashtagStore, LoadHashtag } from 'src/app/core/store/hashtag/hashtag.store';
import { UserStore } from 'src/app/core/store/user/user.store';
import { createId } from 'src/app/core/utils/rand.utils';

@Component({
  selector: 'app-onboard-quarterly-goals',
  templateUrl: './onboard-quarterly-goals.component.html',
  styleUrls: ['./onboard-quarterly-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: OnboardQuarterlyGoalsAnimations,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
  ],
})
export class OnboardQuarterlyGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly quarterlyGoalStore = inject(QuarterlyGoalStore);
  readonly hashtagStore = inject(HashtagStore);
  readonly userStore = inject(UserStore);
  private fb = inject(FormBuilder);

  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  /** Navigation output for parent wizard */
  readonly nextClicked = output<void>();

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** Hashtag colors. */
  readonly HASHTAG_COLORS = ['#EE8B72', '#2DBDB1', '#FFB987'];

  /** FormControls for quarterly goals onboarding initialized with 3 default rows */
  quarterlyGoalsForm = this.fb.group({
    allGoals: this.fb.array([
      this.createGoalRow(0),
      this.createGoalRow(1),
      this.createGoalRow(2),
    ]),
  });

  /** Getter for the form array with a type that allows use of controls. */
  get allGoals(): FormArray {
    return this.quarterlyGoalsForm.get('allGoals') as FormArray;
  }

  /** Signal holding the current form controls for template reactivity */
  goalControls = signal<AbstractControl[]>(this.allGoals.controls);

  // --------------- COMPUTED DATA -----------------------

  /** Check if all goal inputs and hashtags are filled. */
  get isValid(): boolean {
    return this.allGoals.length > 0 && this.quarterlyGoalsForm.valid;
  }

  // --------------- EVENT HANDLING ----------------------

  drop(event: CdkDragDrop<AbstractControl[]>): void {
    moveItemInArray(this.allGoals.controls, event.previousIndex, event.currentIndex);
    this.allGoals.updateValueAndValidity();
    this.goalControls.set([...this.allGoals.controls]);
  }

  addEmptyGoalRow(index: number): void {
    this.allGoals.push(this.createGoalRow(index));
    this.goalControls.set([...this.allGoals.controls]);
  }

  private createGoalRow(index: number, goal?: Partial<QuarterlyGoal>, hashtag?: Partial<Hashtag>): FormGroup {
    return this.fb.group({
      __id: [goal?.__id ?? null],
      text: [goal?.text ?? '', Validators.required],
      __hashtagId: [goal?.__hashtagId ?? null],
      hashtagName: [hashtag?.name ?? '', Validators.required],
      hashtagColor: [hashtag?.color || this.HASHTAG_COLORS[index % this.HASHTAG_COLORS.length]],
      _new: [!goal?.__id],
    });
  }

  async goNext(): Promise<void> {
    if (!this.isValid) {
      return;
    }

    const userId = this.currentUser()?.__id;
    if (!userId) return;

    this.loading.set(true);

    try {
      await this.batchService.batchWrite(
        async (batchConfig) => {
          const controls = this.allGoals.controls;

          await Promise.all(
            controls.map(async (control, i) => {
              const val = control.value;
              const cleanHashtag = val.hashtagName.replace(/^#/, '').trim();

              if (!val.__id) {
                // Add new goal & hashtag
                const hashtagId = createId();
                await this.hashtagStore.add(
                  {
                    __userId: userId,
                    __id: hashtagId,
                    name: cleanHashtag,
                    color: val.hashtagColor || this.HASHTAG_COLORS[i % this.HASHTAG_COLORS.length],
                  },
                  { batchConfig },
                );

                await this.quarterlyGoalStore.add(
                  {
                    __userId: userId,
                    text: val.text.trim(),
                    __hashtagId: hashtagId,
                    completed: false,
                    order: i + 1,
                  },
                  { batchConfig },
                );
              } else {
                // Update existing goal & hashtag
                await this.quarterlyGoalStore.update(
                  val.__id,
                  {
                    text: val.text.trim(),
                    order: i + 1,
                  },
                  { batchConfig },
                );

                if (val.__hashtagId) {
                  await this.hashtagStore.update(
                    val.__hashtagId,
                    {
                      name: cleanHashtag,
                    },
                    { batchConfig },
                  );
                }
              }
            }),
          );

          // Update user onboarding state to STEP_4 (organize-quarterly-goals)
          await this.userStore.update(
            userId,
            { onboardingState: OnboardingState.STEP_4 },
            { batchConfig },
          );
        },
        {
          snackBarConfig: {
            successMessage: 'Quarterly goals saved successfully',
            failureMessage: 'Failed to save quarterly goals',
            config: { duration: 3000 },
          },
        },
      );

      this.nextClicked.emit();
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  async goBack(): Promise<void> {
    const userId = this.currentUser()?.__id;
    if (!userId) return;

    this.loading.set(true);
    try {
      await this.userStore.update(userId, {
        onboardingState: OnboardingState.STEP_2, // Route back to long-term goals transition
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batchService: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {
    this.quarterlyGoalStore.load([
      ['__userId', '==', this.currentUser()?.__id],
      ['completed', '==', false],
    ], { orderBy: 'order' }, (quarterlyGoal) => [
      LoadHashtag.create(this.hashtagStore, [['__id', '==', quarterlyGoal.__hashtagId]], {}),
    ]).then(() => {
      const goals = this.quarterlyGoalStore.selectEntities(
        [
          ['__userId', '==', this.currentUser()?.__id],
          ['completed', '==', false],
        ],
        { orderBy: 'order' },
      );

      if (goals && goals.length > 0) {
        this.allGoals.clear();
        goals.forEach((goal, i) => {
          const hashtag = this.hashtagStore.selectEntity(goal.__hashtagId);
          this.allGoals.push(this.createGoalRow(i, goal, hashtag));
        });
        this.goalControls.set([...this.allGoals.controls]);
      }
    });
  }
}
