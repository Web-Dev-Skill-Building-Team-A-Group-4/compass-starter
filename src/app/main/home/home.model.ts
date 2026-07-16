import { Hashtag } from '../../core/store/hashtag/hashtag.model';
import { QuarterlyGoal as CoreQuarterlyGoal } from 'src/app/core/store/quarterly-goal/quarterly-goal.model';

// database structure
export interface QuarterlyGoal extends CoreQuarterlyGoal {}

// displaying populated fields UI components
export interface QuarterlyGoalData extends CoreQuarterlyGoal {
  hashtag: Hashtag;
}