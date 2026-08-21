import { Component, OnInit, ChangeDetectionStrategy, OutputEmitterRef, input, output, inject, WritableSignal, Signal, signal, computed, Inject } from '@angular/core';
import { QuarterlySidebarItemAnimations } from './quarterly-sidebar-item.animations';
import { User } from 'src/app/core/store/user/user.model';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { WeeklyGoalData } from '../../../home/home.model';

@Component({
  selector: 'app-quarterly-sidebar-item',
  templateUrl: './quarterly-sidebar-item.component.html',
  styleUrls: ['./quarterly-sidebar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: QuarterlySidebarItemAnimations,
  standalone: true,
  imports: [
    MatDividerModule,
    MatCheckboxModule,
  ],
})
export class QuarterlySidebarItemComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  // --------------- INPUTS AND OUTPUTS ------------------

  /** The current signed in user. */
  currentUser: Signal<User> = this.authStore.user;
  /** Checked signal to determine complete goals. */
  checked: OutputEmitterRef<WeeklyGoalData> = output<WeeklyGoalData>();
  /** Weekly goal input. */
  goal = input<WeeklyGoalData>();

  // --------------- LOCAL UI STATE ----------------------

  // --------------- COMPUTED DATA -----------------------

  checkGoal(goal: WeeklyGoalData) {
    this.checked.emit(goal);
  }

  // --------------- EVENT HANDLING ----------------------

  // --------------- OTHER -------------------------------

  constructor(
  ) { }

  // --------------- LOAD AND CLEANUP --------------------
  
  ngOnInit(): void {
  }
}
