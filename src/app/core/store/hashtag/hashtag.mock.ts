import { Timestamp } from '@angular/fire/firestore';
import { Hashtag } from './hashtag.model';
import { withEntitiesForMockDB } from 'src/app/core/store/app.store';
import { signalStore } from '@ngrx/signals';
import { USER_DB } from '../user/user.mock';

export const HashtagMockDB = signalStore(
  { providedIn: 'root' },
  withEntitiesForMockDB<Hashtag>(),
);

export const HASHTAG_DB = [
  {
    __id: 'ht1',
    __userId: USER_DB[0].__id,
    name: 'coverletter',
    color: '#EE8B72',
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
  {
    __id: 'ht2',
    __userId: USER_DB[0].__id,
    name: 'apply-internships',
    color: '#2DBDB1',
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
  {
    __id: 'ht3',
    __userId: USER_DB[0].__id,
    name: 'interview',
    color: '#FFB987',
    _createdAt: Timestamp.now(),
    _updatedAt: Timestamp.now(),
    _deleted: false,
  },
];
