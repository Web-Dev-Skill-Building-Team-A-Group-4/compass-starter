import { Component, OnInit,  ChangeDetectionStrategy, Inject, Injector } from '@angular/core';
import { WeeklyGoalsModalAnimations } from './weekly-goals-modal.animations';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WeeklyGoal } from 'src/app/core/store/weekly-goal/weekly-goal.model';
import { QuarterlyGoalData, WeeklyGoalInForm } from '../../home.model';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray,} from '@angular/cdk/drag-drop';
import { NgFor } from '@angular/common';
import { endOfWeek, startOfWeek } from 'src/app/core/utils/time.utils';

@Component({
  selector: 'app-weekly-goals-modal',
  templateUrl: './weekly-goals-modal.component.html',
  styleUrls: ['./weekly-goals-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: WeeklyGoalsModalAnimations,
  standalone: true,
  imports: [
    MatIconButton,
    MatDialogClose,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    MatFormField,
    MatInput,
    MatSelect,
    MatOption,
    NgFor,
  ],
})
export class WeeklyGoalsModalComponent implements OnInit {
  // --------------- INPUTS AND OUTPUTS ------------------

  // --------------- LOCAL UI STATE ----------------------

  /** FormControls for editing past goals and adding a new one */
  weeklyGoalsForm = this.fb.group({
    allGoals: this.fb.array([
      this.fb.group({
        text: ['', Validators.required],
        originalText: [''],
        originalOrder: [1],
        __weeklyGoalId: [''],
        __quarterlyGoalId: [''], // changed from hashtagId
      }),
    ]),
  });

  /** Getter for the form array with a type that allows use of controls. */
  get allGoals() {
    return this.weeklyGoalsForm.get('allGoals') as FormArray;
  }

  /** Editable weekly goals form. */
  mutableWeekGoalsForm: WeeklyGoal[];

  /** Declare FormGroup for new goal */
  goalForm: FormGroup = new FormGroup({
    text: new FormControl(), // Assuming you have a control for the goal text
    __quarterlyGoalId: new FormControl(), // Assuming you have a control for the hashtag ID
  });

  // --------------- COMPUTED DATA -----------------------

  endOfWeek = endOfWeek; // import from time.utils.ts

  startOfWeek = startOfWeek; // import from time.utils.ts

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
  /** Add a goal to the form. */
  addGoalToForm(goal: WeeklyGoalInForm) {
    if (goal) {
      this.allGoals.push(
        this.fb.group({
          text: [goal.text, Validators.required],
          originalText: [goal.text],
          originalOrder: [goal.originalOrder],
          originalQuarterlyGoalId: [goal.__quarterlyGoalId],
          __weeklyGoalId: [goal.__weeklyGoalId],
          __quarterlyGoalId: [goal.__quarterlyGoalId, Validators.required],
          _deleted: [false],
          _new: [false],
        }),
      );
    } else {
      this.allGoals.push(
        this.fb.group({
          text: ['', Validators.required],
          __quarterlyGoalId: ['', Validators.required],
          _deleted: [false],
          _new: [true],
        }),
      );
    }
  }

  /** Support drag and drop of goals. */
  drop(event: CdkDragDrop<WeeklyGoal[]>) {
    moveItemInArray(
      this.allGoals.controls,
      event.previousIndex,
      event.currentIndex,
    );
  }

  /**
   * Moves an item in a FormArray to another position.
   * @param formArray FormArray instance in which to move the item.
   * @param fromIndex Starting index of the item.
   * @param toIndex Index to which he item should be moved.
   * https://stackoverflow.com/questions/56149461/draggable-formgroups-in-formarray-reactive-forms
   */
  moveItemInFormArray(
    formArray: FormArray,
    fromIndex: number,
    toIndex: number,
  ) {
    const dir = toIndex > fromIndex ? 1 : -1;

    const from = fromIndex;
    const to = toIndex;

    const temp = formArray.at(from);
    for (let i = from; i * dir < to * dir; i = i + dir) {
      const current = formArray.at(i + dir);
      formArray.setControl(i, current);
    }
    formArray.setControl(to, temp);
  }

  /** Save any updates for any of the goals. */
  async saveGoals() {
    await this.data.updateWeeklyGoals(this.allGoals);
  }

  fullDelete(e, i) {
    if (
      e.target.checked &&
      this.weeklyGoalsForm.get(['allGoals', i, '_new']).value
    ) {
      this.allGoals.removeAt(i);
    }
  }

  // --------------- OTHER -------------------------------

  constructor(
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      goalDatas: Partial<QuarterlyGoalData>[];
      incompleteGoals: WeeklyGoal[];
      updateWeeklyGoals: (weeklyGoalsFormArray: FormArray) => void;
    },
    public dialogRef: MatDialogRef<WeeklyGoalsModalComponent>,
    private fb: FormBuilder,
  ) {
    // Initialize the quarterGoalsForm with the set of incompleteGoals
    this.allGoals.clear();
    if (this.data.incompleteGoals.length == 0) {
      this.addGoalToForm(null);
    } else {
      this.data.incompleteGoals.forEach((goal) => {
        this.addGoalToForm({
          text: goal.text,
          __quarterlyGoalId: goal.__quarterlyGoalId,
          originalText: goal.text,
          originalOrder: goal.order,
          originalQuarterlyGoalId: goal.__quarterlyGoalId,
          __weeklyGoalId: goal.__id,
          _deleted: goal._deleted,
          _new: false,
        });
      });
    }
  }

  // --------------- LOAD AND CLEANUP --------------------

  ngOnInit(): void {}
}
