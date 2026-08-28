import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WeeklyGoalsModalAnimations } from './weekly-goals-modal.animations';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { WeeklyGoalData, WeeklyGoalInForm, QuarterlyGoalData } from '../../home.model';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-weekly-goals-modal',
  templateUrl: './weekly-goals-modal.component.html',
  styleUrls: ['./weekly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsModalAnimations,
  standalone: true,
  imports: [
    MatIconButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    MatTooltip,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    MatDialogModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSelectTrigger
  ],
})
export class WeeklyGoalsModalComponent {
  private dialogRef = inject(MatDialogRef<WeeklyGoalsModalComponent>, { optional: true });
  private fb = inject(FormBuilder);

  readonly data: {
    startOfWeek: any;
    endOfWeek: any;
    goals: WeeklyGoalData[];
    quarterlyGoals: QuarterlyGoalData[];
    updateWeeklyGoals: (weeklyGoalsFormArray: FormArray) => void;
  } = inject(MAT_DIALOG_DATA);

  quarterlyGoals = this.data.quarterlyGoals;
  startOfWeek = this.data.startOfWeek;
  endOfWeek = this.data.endOfWeek;

  // --------------- LOCAL UI STATE ----------------------

  /** FormControls for editing existing goals and adding new ones. */
  weeklyGoalsForm = this.fb.group({
    allGoals: this.fb.array([]),
  });

  /** Getter for the form array with a type that allows use of controls. */
  get allGoals() {
    return this.weeklyGoalsForm.get('allGoals') as FormArray;
  }

  // --------------- COMPUTED DATA -----------------------

  /**
   * Get the count of newly added goals that are not marked for deletion.
   * A goal is considered newly added if its `_new` flag is true.
   */
  get addedGoalsCount() {
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
        goal.dirty &&
        goal.value.text !== goal.value.originalText &&
        !goal.value._new &&
        !goal.value._deleted,
    ).length;
  }

  /**
   * Get the count of goals that are marked for deletion.
   * A goal is considered marked for deletion if its `_deleted` flag is true.
   */
  get deletedGoalsCount() {
    return this.allGoals.controls.filter((goal) => goal.value._deleted).length;
  }


  // --------------- EVENT HANDLING ----------------------

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  /** Get hashtag for a specific quarterly goal ID */
  getHashtag(quarterlyGoalId: string) {
    if (!quarterlyGoalId) return null;

    // Find the quarterly goal in the array that matches the ID
    const matchingGoal = this.quarterlyGoals.find(goal => goal.__id === quarterlyGoalId);

    // If we found it, return its hashtag. Otherwise, return null.
    return matchingGoal ? matchingGoal.hashtag : null;
  }

  drop(event: CdkDragDrop<WeeklyGoalData[]>) {
    moveItemInArray(this.allGoals.controls, event.previousIndex, event.currentIndex);
    this.allGoals.updateValueAndValidity();
  }

  /** Add a goal to the form. Pass an existing goal to seed a row from saved data, or omit for a blank new row. */
  addGoalToForm(goal?: WeeklyGoalInForm) {
    if (goal) {
      this.allGoals.push(
        this.fb.group({
          __weeklyGoalId: [goal.__weeklyGoalId],
          text: [goal.text, Validators.required],
          originalText: [goal.text],
          originalOrder: [goal.originalOrder],
          __quarterlyGoalId: [goal.__quarterlyGoalId],
          originalQuarterlyGoalId: [goal.__quarterlyGoalId],
          _deleted: [false],
          _new: [false],
        }),
      );
    } else {
      this.allGoals.push(
        this.fb.group({
          text: ['', Validators.required],
          __quarterlyGoalId: [''],
          _deleted: [false],
          _new: [true],
        }),
      );
    }
  }

  /**
   * Removes a goal row.
   * Unsaved (`_new`) rows are removed from the form outright once confirmed via the
   * checkbox — nothing has been persisted yet, so there's nothing to soft-delete.
   * Saved rows stay in the array with `_deleted` toggled and get filtered out server-side
   * on save(), so the row can still be restored before the modal is saved.
   */
  fullDelete(e: Event, i: number) {
    const checkbox = e.target as HTMLInputElement;
    if (
      checkbox.checked &&
      this.weeklyGoalsForm.get(['allGoals', i, '_new'])?.value
    ) {
      this.allGoals.removeAt(i);
    }
  }
  /** Save the changes */
  async save() {
    await this.data.updateWeeklyGoals(this.allGoals);
  }

  constructor() {
    this.allGoals.clear();
    this.data.goals.forEach((goal) => {
      this.allGoals.push(
        this.fb.group({
          __weeklyGoalId: [goal.__id],
          text: [goal.text, Validators.required],
          originalText: [goal.text],
          originalOrder: [goal.order],
          __quarterlyGoalId: [goal.__quarterlyGoalId],
          originalQuarterlyGoalId: [goal.__quarterlyGoalId],
          _deleted: [false],
          _new: [false],
        }),
      );
    });
    // Seed one empty row so the modal never opens completely blank.
    if (this.allGoals.length === 0) {
      this.addGoalToForm();
    }
  }
}
