import { Component, OnInit, ChangeDetectionStrategy, output, inject, WritableSignal, Signal, signal, Inject, Injector } from '@angular/core';
import { QuarterlyGoalsModalAnimations } from './quarterly-goals-modal.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { CdkDragDrop, CdkDrag, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { QUARTERLYGOAL_DB } from '../../../../core/store/quarterly-goal/quarterly-goal.mock';
import { HASHTAG_DB } from 'src/app/core/store/hashtag/hashtag.mock';
import { Hashtag } from 'src/app/core/store/hashtag/hashtag.model';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';

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
  ],
})
export class QuarterlyGoalsModalComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private dialogRef = inject(MatDialogRef<QuarterlyGoalsModalComponent>, { optional: true });

  // --------------- INPUTS AND OUTPUTS ------------------
  currentUser: Signal<User> = this.authStore.user;
  closeModal = output<void>();

  onClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.closeModal.emit();
    }
  }

  // --------------- LOCAL UI STATE ----------------------
  loading: WritableSignal<boolean> = signal(false);
  task = signal<QuarterlyGoal[]>(structuredClone(QUARTERLYGOAL_DB));

  /** hashtag options from mock.ts file. */
  htg: Hashtag[] = HASHTAG_DB;
  /** maps hashtag __id to the hashtag object for quick lookup */
  htgIdMap = Object.fromEntries(
    this.htg.map((h) => [h.__id, h]),
  );

  // --------------- EVENT HANDLING ----------------------
  drop(event: CdkDragDrop<QuarterlyGoal[]>) {
    this.task.update((tasks) => {
      moveItemInArray(tasks, event.previousIndex, event.currentIndex);
      return tasks;
    });
  }

  onHashtagChange(item: QuarterlyGoal, tag: Hashtag) {
    this.task.update((tasks) =>
      tasks.map((t) =>
        t.__id === item.__id ? { ...t, __hashtagId: tag.__id } : t,
      ),
    );
  }

  onTextChange(item: QuarterlyGoal, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.task.update((tasks) =>
      tasks.map((t) => (t.__id === item.__id ? { ...t, text: value } : t)),
    );
  }

  onHashtagTextChange(item: QuarterlyGoal, event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const name = raw.startsWith('#') ? raw.slice(1) : raw;
    const match = this.htg.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    if (!match) return;
    this.task.update((tasks) =>
      tasks.map((t) =>
        t.__id === item.__id ? { ...t, __hashtagId: match.__id } : t,
      ),
    );
  }
  
  save() {
    console.log(this.task());
  }

  constructor(
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) {}

  ngOnInit(): void {}
}