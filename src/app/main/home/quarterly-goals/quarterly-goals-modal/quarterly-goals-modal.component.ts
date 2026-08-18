import { Component, OnInit, ChangeDetectionStrategy, output, inject, WritableSignal, Signal, signal, Inject, Injector, computed } from '@angular/core';
import { QuarterlyGoalsModalAnimations } from './quarterly-goals-modal.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuarterlyGoal } from '../../../../core/store/quarterly-goal/quarterly-goal.model';
import { QuarterlyGoalData, QuarterlyGoalInForm } from '../../home.model'; 
import { QUARTERLYGOAL_DB } from '../../../../core/store/quarterly-goal/quarterly-goal.mock';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { getQuarterAndYear } from '../../../../core/utils/time.utils';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-quarterly-goals-modal',
  templateUrl: './quarterly-goals-modal.component.html',
  styleUrls: ['./quarterly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlyGoalsModalAnimations,
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatDialogModule,
    ReactiveFormsModule,
    MatTooltip,
  ],
})
export class QuarterlyGoalsModalComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private dialogRef = inject(MatDialogRef<QuarterlyGoalsModalComponent>, { optional: true });
  
  // --------------- INPUTS AND OUTPUTS ------------------
  currentUser: Signal<User> = this.authStore.user;
  closeModal = output<void>();

  // --------------- LOCAL UI STATE ----------------------
  loading: WritableSignal<boolean> = signal(false);

  /** FormControls for editing past goals and adding a new one */
  quarterlyGoalsForm = this.fb.group({
    allGoals: this.fb.array([
      this.fb.group({
        text: ['', Validators.required],
        hashtagName: ['', Validators.required],
        hashtagColor: [''],
        originalText: [''],
        originalHashtag: [''],
        originalOrder: [1],
        __hashtagId: [''], // changed from hashtagId
      }),
    ]),
  });
  /** Getter for the form array with a type that allows use of controls. */
  get allGoals() {
    return this.quarterlyGoalsForm.get('allGoals') as FormArray;
  }

  // --------------- COMPUTED DATA -----------------------
  
  getQuarterAndYear = getQuarterAndYear;

    /**
   * Get the count of newly added goals that are not marked for deletion.
   * A goal is considered newly added if its `_new` flag is true.
   */
  get addedGoalsCount() {
    // Filter the goals to find those that are newly added (_new is true) and not marked as deleted (_deleted is false)
    return this.allGoals.controls.filter(
      (goal) => goal.value._new && !goal.value._deleted,
    ).length;
  }

  /**
   * Calculates the number of edited goals.
   * Only counts goals that are dirty (edited), have different text from original,
   * are not newly added (_new is false), and are not marked as deleted (_deleted is false).
   */
  get editedGoalsCount() {
    return this.allGoals.controls.filter(
      (goal) =>
        goal.dirty && // Check if the goal has been edited
        goal.value.text !== goal.value.originalText && // Compare current text with original text
        !goal.value._new && // Ensure the goal is not newly added
        !goal.value._deleted, // Ensure the goal is not marked for deletion
    ).length;
  }

  /**
   * Get the count of goals that are marked for deletion.
   * A goal is considered marked for deletion if its `_deleted` flag is true.
   */
  get deletedGoalsCount() {
    // Filter the goals to find those that are marked as deleted (_deleted is true)
    return this.allGoals.controls.filter((goal) => goal.value._deleted).length;
  }

  // --------------- EVENT HANDLING ----------------------

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  
  drop(event: CdkDragDrop<QuarterlyGoalData[]>) {
    moveItemInArray(this.allGoals.controls, event.previousIndex, event.currentIndex);
    this.allGoals.updateValueAndValidity();
  }

  /** Add a goal to the form. */
  addGoalToForm(goal: QuarterlyGoalInForm) {
    if (goal) {
      this.allGoals.push(
        this.fb.group({
          text: [goal.text, Validators.required],
          hashtagName: [goal.hashtagName],
          originalText: [goal.text],
          originalOrder: [goal.originalOrder],
          originalHashtagName: [goal.hashtagName],
          __quarterlyGoalId: [goal.__quarterlyGoalId, Validators.required],
          __hashtagId: [goal.__hashtagId, Validators.required],
          weeklyGoalsTotal: [goal.weeklyGoalsTotal],
          _deleted: [false],
          _new: [false],
        }),
      );
    } else {
      this.allGoals.push(
        this.fb.group({
          text: ['', Validators.required],
          hashtagName: ['', Validators.required],
          hashtagColor: [''],
          __hashtagId: [''],
          weeklyGoalsTotal: [0],
          _deleted: [false],
          _new: [true],
        }),
      );
    }
  }
  
  async save() {
    await this.data.updateQuarterlyGoals(this.allGoals);
  }

  fullDelete(e: Event, i: number) {
    const checkbox = event.target as HTMLInputElement;
    if (
      checkbox.checked &&
      this.quarterlyGoalsForm.get(['allGoals', i, '_new']).value
    ) {
      this.allGoals.removeAt(i);
    }
  }

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
    @Inject(MAT_DIALOG_DATA) 
    public data: { 
      goals: QuarterlyGoalData[];
      hashtags: Hashtag[];
      updateQuarterlyGoals: (quarterlyGoalsFormArray: FormArray) => void; 
    },
    private fb: FormBuilder,
  ) {
    // Initialize the quarterGoalsForm
    this.allGoals.clear();
    this.data.goals.forEach((goal) => {
      this.allGoals.push(
        this.fb.group({
          __id: [goal.__id],
          text: [goal.text, Validators.required],
          originalText: [goal.text],
          originalOrder: [goal.order],
          __hashtagId: [goal.__hashtagId],
          hashtagName: [goal.hashtag?.name ?? ''],
          hashtagColor: [goal.hashtag?.color ?? ''],
          _deleted: [false],
          hashtag: this.fb.group({
            __id: [goal.hashtag?.__id],
            name: [goal.hashtag?.name],
            color: [goal.hashtag?.color],
          }),
          weeklyGoalsTotal: [goal.weeklyGoalsTotal],
        })
      );
    });
  }

  ngOnInit(): void {
  }
}