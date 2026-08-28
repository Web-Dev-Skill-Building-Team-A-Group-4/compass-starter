import { Timestamp } from '@angular/fire/firestore';

/** Helper function for calculating quarter name and year */
export function getQuarterAndYear() {
  const quarter = new Date();
  const quarterYear = new Date(new Date().setFullYear(quarter.getFullYear()));

  switch (quarter.getMonth() + 1) {
    case 1:
    case 2:
    case 3:
      return 'Winter' + ' ' + quarterYear.getFullYear();
    case 4:
    case 5:
    case 6:
      return 'Spring' + ' ' + quarterYear.getFullYear();
    case 7:
    case 8:
    case 9:
      return 'Summer' + ' ' + quarterYear.getFullYear();
    case 10:
    case 11:
    case 12:
      return 'Fall' + ' ' + quarterYear.getFullYear();
    default:
      return 'Invalid Month';
  }
}

/** Helper function for calculating the start and end of a quarter */
export function getStartAndEndDate() {
  const today = new Date();
  const currentQuarter = Math.floor((today.getMonth() / 3)) + 1; // 1 = Q1, 2 = Q2, 3 = Q3, 4 = Q4
  let quarterStartDate: Date;
  let quarterEndDate: Date;

  switch (currentQuarter) {
    case 1: // Winter (Jan-Mar)
      quarterStartDate = new Date(today.getFullYear(), 0, 1); // January 1st
      quarterEndDate = new Date(today.getFullYear(), 2, 31); // March 31st
      break;
    case 2: // Spring (Apr-Jun)
      quarterStartDate = new Date(today.getFullYear(), 3, 1); // April 1st
      quarterEndDate = new Date(today.getFullYear(), 5, 30); // June 30th
      break;
    case 3: // Summer (Jul-Sep)
      quarterStartDate = new Date(today.getFullYear(), 6, 1); // July 1st
      quarterEndDate = new Date(today.getFullYear(), 8, 30); // September 30th
      break;
    case 4: // Autumn (Oct-Dec)
      quarterStartDate = new Date(today.getFullYear(), 9, 1); // October 1st
      quarterEndDate = new Date(today.getFullYear(), 11, 31); // December 31st
      break;
    default: // Handle invalid quarter
      throw new Error('Invalid quarter number');
  }
  quarterStartDate.setHours(0, 0, 0, 0);
  quarterEndDate.setHours(0, 0, 0, 0);
  return [quarterStartDate, quarterEndDate];
}

/** Helper function to get the start of the week as a string. */
export function startOfWeek() {
  const today = new Date();
  const startDate = new Date(new Date().setDate(today.getDate() - today.getDay()));
  return (startDate.getMonth() + 1) + '/' + startDate.getDate();
}

/**
 * Helper function to get the start of the week as a date object.
 * Citation: https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
 * */
export function getStartWeekDate() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Create a new date object for the Sunday of the current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  // Set the time to midnight
  sunday.setHours(0, 0, 0, 0);

  return sunday;
}

/** Helper function to get the end of the week as a string. */
export function endOfWeek() {
  const today = new Date();
  const endDate = new Date(new Date().setDate(today.getDate() + (6 - today.getDay())));
  return (endDate.getMonth() + 1) + '/' + endDate.getDate();
}

/** Used for checking if we're due for a reflection */
export function isFromWeekBeforePreviousWeek(timestamp: Timestamp): boolean {
  // Get the start of the current week and calculate the start of two weeks ago
  const currentWeekStart = getStartWeekDate();

  // Get the start date of the week before that (previous week)
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7); // Subtract one week

  // Convert Firebase Timestamp to Date
  const firebaseDate = timestamp.toDate();

  // Check if the Firebase Timestamp is within the week before the previous week
  return firebaseDate < previousWeekStart;
}

/** Helper function for calculating the start and end of a quarter. */
export function getReflectPeriod(timestamp: Timestamp) {
  const today = timestamp.toDate();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Create a new date object for the Sunday of the current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);

  // Set the time to midnight
  sunday.setHours(0, 0, 0, 0);

  return [sunday, getEndOfPreviousWeek()];
}

/** Helper function to get the end of the previous week (Sunday at 11:59:59 PM) */
export function getEndOfPreviousWeek() {
  // Get the start of the current week
  const currentWeekStart = getStartWeekDate();

  // Calculate the end of the previous week (the last moment of the previous Sunday)
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(currentWeekStart.getDate() - 1); // Subtract one day to get the previous Sunday

  // Set the time to 11:59:59.999 PM (the last moment of Sunday)
  previousWeekEnd.setHours(23, 59, 59, 999);

  return previousWeekEnd;
}

/** Helper function to get the start of the previous week (Sunday at midnight) */
export function getStartOfPreviousWeek() {
  // Get the start of the current week
  const currentWeekStart = getStartWeekDate();

  // Calculate the start of the previous week (subtract 7 days from the start of the current week)
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7); // Subtract one week

  // Set the time to midnight (start of the previous week)
  previousWeekStart.setHours(0, 0, 0, 0);

  return previousWeekStart;
}

/**
 * Returns the start of the week (Sunday at midnight) for a given date.
 * Difference from getStartWeekDate() because this gets the start of the week for ANY date, rather than today only.
 * @param date The reference date.
 * @returns {Date} The start of the week (Sunday).
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - dayOfWeek);
  return d;
}
