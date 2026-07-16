import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector } from '@angular/core';
import { LongTermGoalsAnimations } from './long-term-goals.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { LongTermGoalsHeaderComponent } from './long-term-goals-header/long-term-goals-header.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-long-term-goals',
  templateUrl: './long-term-goals.component.html',
  styleUrls: ['./long-term-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LongTermGoalsAnimations,
  standalone: true,
  imports: [
    LongTermGoalsHeaderComponent,
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

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------

  openModal(editClicked: boolean) {
    this.snackBar.open('Pencil icon clicked!', '', {
      duration: 1000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
    });
  }

  // --------------- OTHER -------------------------------

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
