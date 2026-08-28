import { Timestamp } from '@angular/fire/firestore';

/** user data */
export interface User {
  __id: string;
  _createdAt?: Timestamp;
  _updatedAt?: Timestamp;
  _deleted?: boolean;
  name: string;
  email: string;
  photoURL?: string;
  tokens?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
  };
  onboardingState: OnboardingState;
}

export enum OnboardingState {
  WELCOME = 'welcome', // welcome page
  STEP_1 = 'step 1', // initial long-term goals
  STEP_2 = 'step 2', // transition to setting quarterly goals
  STEP_3 = 'step 3', // initial quarterly goals
  STEP_4 = 'step 4', // hashtags
  STEP_5 = 'step 5', // transition to setting weekly goals
  STEP_6 = 'step 6', // initial weekly goals
  STEP_7 = 'step 7', // set weekly goals hashtags
  DONE = 'done', // all done
}
