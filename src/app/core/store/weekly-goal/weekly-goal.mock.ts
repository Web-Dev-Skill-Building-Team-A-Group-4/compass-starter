import { Timestamp } from '@angular/fire/firestore';
import { WeeklyGoal } from './weekly-goal.model';
import { withEntitiesForMockDB } from '../app.store';
import { signalStore } from '@ngrx/signals';
import { USER_DB } from '../user/user.mock';

export const WeeklyGoalMockDB = signalStore(
  { providedIn: 'root' },
  withEntitiesForMockDB<WeeklyGoal>(),
);

export const WEEKLYGOAL_DB = [
  {
    __id: 'wg1',
    __userId: USER_DB[0].__id,
    __quarterlyGoalId: 'qg1',
    __hashtagId: 'ht1',
    text: 'Finish Google cover letter',
    completed: false,
    order: 1,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
  {
    __id: 'wg2',
    __userId: USER_DB[0].__id,
    __quarterlyGoalId: 'qg2',
    __hashtagId: 'ht2',
    text: 'Apply to Microsoft',
    completed: false,
    order: 2,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
  {
    __id: 'wg3',
    __userId: USER_DB[0].__id,
    __quarterlyGoalId: 'qg3',
    __hashtagId: 'ht3',
    text: 'Review data structures',
    completed: false,
    order: 3,
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
  {
    __id: 'wg4',
    __userId: USER_DB[0].__id,
    __quarterlyGoalId: 'qg2',
    __hashtagId: 'ht2',
    text: 'Apply to OpenAI',
    completed: true,
    order: 4,
    completionDate: Timestamp.now(),
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
];
