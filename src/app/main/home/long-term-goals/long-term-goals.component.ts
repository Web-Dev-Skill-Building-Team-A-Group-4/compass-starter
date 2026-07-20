import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { LongTermGoalsAnimations } from './long-term-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { LongTermGoalsHeaderComponent } from './long-term-goals-header/long-term-goals-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LongTermGoalsModalComponent } from './long-term-goals-modal/long-term-goals-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LongTermGoalsData } from '../home.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-long-term-goals',
  templateUrl: './long-term-goals.component.html',
  styleUrls: ['./long-term-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsAnimations,
  standalone: true,
  imports: [ 
    LongTermGoalsHeaderComponent,
    LongTermGoalsModalComponent,    
  ],
})
export class LongTermGoalsComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  // --------------- LOCAL UI STATE ----------------------

  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);

  /** For storing the dialogRef in the opened modal. */
  dialogRef: MatDialogRef<any>;

  sampleData: LongTermGoalsData = {
    __id: 'ltg',
    __userId: 'test-user',
    oneYear: 'Secure SWE or UX Engineering Internship',
    fiveYear: 'SWE with UX/Design/Animation oriented work',
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  };

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  openModal(editClicked: boolean) {
    this.dialogRef = this.dialog.open(LongTermGoalsModalComponent, {
      height: '90%',
      width: '90%',
      position: { bottom: '0' },
      panelClass: 'goal-modal-panel',
      data: { goals: this.sampleData },
    });
  }

  // --------------- OTHER -------------------------------

  constructor(
    private dialog: MatDialog,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
