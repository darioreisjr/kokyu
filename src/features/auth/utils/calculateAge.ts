/**
 * Age in whole years as of `referenceDate` (defaults to now). Correctly
 * accounts for whether the birthday has already happened this year —
 * `referenceDate.getFullYear() - birthDate.getFullYear()` alone is
 * wrong whenever the birthday hasn't occurred yet this year.
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();

  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();
  const birthdayNotYetReached = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0);

  if (birthdayNotYetReached) {
    age -= 1;
  }

  return age;
}
