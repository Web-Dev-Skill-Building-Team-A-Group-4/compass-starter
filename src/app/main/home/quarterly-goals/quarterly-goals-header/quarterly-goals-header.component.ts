import { Component, OnInit, ChangeDetectionStrategy, input, output, inject, WritableSignal, Signal, signal, computed, Inject, Injector, OutputEmitterRef } from '@angular/core';
import { QuarterlyGoalsHeaderAnimations } from './quarterly-goals-header.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { BatchWriteService, BATCH_WRITE_SERVICE } from 'src/app/core/store/batch-write.service';
import { getQuarterAndYear } from '../../../../core/utils/time.utils';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-quarterly-goals-header',
  templateUrl: './quarterly-goals-header.component.html',
  styleUrls: ['./quarterly-goals-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, 
  animations: QuarterlyGoalsHeaderAnimations, 
  standalone: true,
  imports: [
  ],
})
export class QuarterlyGoalsHeaderComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------
  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;

  editClicked = output<boolean>();

  // --------------- LOCAL UI STATE ----------------------
  /** Loading icon. */
  loading: WritableSignal<boolean> = signal(false);
  
  getQuarterAndYear = getQuarterAndYear;

  // --------------- COMPUTED DATA -----------------------

  // --------------- EVENT HANDLING ----------------------
  editGoal(){
    this.editClicked.emit(true);
  }

  // --------------- OTHER -------------------------------

  constructor(
    private snackBar: MatSnackBar,
    private injector: Injector,
    @Inject(BATCH_WRITE_SERVICE) private batch: BatchWriteService,
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
