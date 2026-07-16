// Add any extra data types you'll need here!
import { Hashtag } from '../../core/store/hashtag/hashtag.model';
import { WeeklyGoal } from '../../core/store/weekly-goal/weekly-goal.model';
import { QuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';

export interface WeeklyGoalData extends WeeklyGoal {
  hashtag: Hashtag;
}

export interface QuarterlyGoalData extends QuarterlyGoal {
  hashtag: Hashtag;
  weeklyGoalsTotal: number;
  weeklyGoalsComplete: number;
}

export interface WeeklyGoalInForm {
  text: string;
  __quarterlyGoalId: string;
  _deleted: boolean;
  originalText?: string;
  __weeklyGoalId?: string;
  originalOrder?: number;
  originalQuarterlyGoalId?: string;
  _new: boolean;
}
