import { Timestamp } from '@angular/fire/firestore';
import { withEntitiesForMockDB } from '../app.store';
import { signalStore } from '@ngrx/signals';
import { User, OnboardingState } from './user.model';

export const UserMockDB = signalStore(
  { providedIn: 'root' },
  withEntitiesForMockDB<User>(),
);

export const createMockUser = (overrides?: Partial<User>): User => ({
  __id: '1',
  email: 'a@sample.com',
  name: 'User A',
  photoURL: '/images/tech4good-logo.png',
  onboardingState: OnboardingState.DONE,
  _createdAt: Timestamp.now(),
  _updatedAt: Timestamp.now(),
  _deleted: false,
  ...overrides,
});

export const USER_DB: User[] = [
  createMockUser({
    __id: '1',
    email: 'a@sample.com',
    name: 'User A',
    onboardingState: OnboardingState.DONE,
  }),
  createMockUser({
    __id: '2',
    email: 'b@sample.com',
    name: 'User Bob',
    onboardingState: OnboardingState.DONE,
  }),
  createMockUser({
    __id: '3',
    email: 'c@sample.com',
    name: 'User C',
    onboardingState: OnboardingState.DONE,
  }),
  createMockUser({
    __id: 'test-onboarding-user',
    email: 'onboarding@sample.com',
    name: 'Onboarding User',
    onboardingState: OnboardingState.STEP_1,
  }),
];