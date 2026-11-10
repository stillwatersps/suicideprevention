// Age helpers, with no browser in them, so the tests can import them alone.
// Age in whole years on a given day.
export function ageOn(birth, today) {
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}
export function groupFor(age) {
  if (age < 13) return 'child';
  if (age < 18) return 'teen';
  if (age < 25) return 'young';
  if (age < 65) return 'adult';
  return 'older';
}
