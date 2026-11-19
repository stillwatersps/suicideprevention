// "A first week": seven small things already in the app, in an order to try them. Pure rules,
// no browser and no phone. Only which steps were ticked is kept: no dates, no count of days, no
// streak, and nothing that minds how long the person takes. A draft: no licensed reviewer has seen it.

// What each step opens: a screen's name, or a session.
export const STEPS = ['reset', 'ground', 'scan', 'good', 'walk', 'kind', 'plan'];

export const emptyCourse = () => ({ done: [] });

// Whatever was stored comes back as a clean list of step numbers, in order, or empty: never broken.
export function cleanCourse(stored, limits) {
  const list = stored && typeof stored === 'object' && !Array.isArray(stored) && Array.isArray(stored.done) ? stored.done : [];
  return { done: [...new Set(list.filter((n) => Number.isInteger(n) && n >= 0 && n < limits.steps))].sort((a, b) => a - b) };
}
export const isDone = (course, index) => course.done.indexOf(index) !== -1;
export function setDone(course, index, on, limits) {
  const rest = course.done.filter((n) => n !== index);
  return cleanCourse({ done: on ? rest.concat([index]) : rest }, limits);
}
// The first step not ticked yet, or -1 when all are.
export function nextStep(course, limits) {
  for (let i = 0; i < limits.steps; i += 1) if (!isDone(course, i)) return i;
  return -1;
}
// For "a copy of my data": the names of the steps that were ticked.
export const courseLines = (course, names) => course.done.filter((i) => names[i]).map((i) => '- ' + names[i]);
