import { Timestamp } from '@angular/fire/firestore';
import { LongTermGoal } from './long-term-goal.model';
import { withEntitiesForMockDB } from 'src/app/core/store/app.store';
import { signalStore } from '@ngrx/signals';
import { USER_DB } from '../user/user.mock';

export const LongTermGoalMockDB = signalStore(
  { providedIn: 'root' },
  withEntitiesForMockDB<LongTermGoal>(),
);

export const LONGTERMGOAL_DB = [
  {
    __id: 'ltg',
    __userId: USER_DB[0].__id,
    oneYear: 'Secure SWE or UX Engineering Internship',
    fiveYear: 'SWE with UX/Design/Animation oriented work',
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
];
