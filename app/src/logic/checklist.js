// The setup checklist on Home. Every item is worked out from the app's real state each time (the
// phone's actual permissions, what is actually saved), never from a stored "done" flag.

export const CHECKLIST = ['name', 'count', 'style', 'location', 'homeSpot', 'notifications', 'firstCheckIn', 'firstMeditation'];

// facts: { name, countChosen, styleChosen, locationPermission, home, notificationPermission,
//          remindersOn, checkInCount, meditationCount }
export function deriveChecklist(facts) {
  const f = facts || {};
  const done = {
    name: Boolean(f.name && String(f.name).trim()),
    count: Boolean(f.countChosen),
    style: Boolean(f.styleChosen),
    location: f.locationPermission === 'granted',
    homeSpot: Boolean(f.home && Number.isFinite(f.home.latitude) && Number.isFinite(f.home.longitude)),
    notifications: f.notificationPermission === 'granted' && Boolean(f.remindersOn),
    firstCheckIn: Number(f.checkInCount) > 0,
    firstMeditation: Number(f.meditationCount) > 0,
  };
  return CHECKLIST.map((id) => ({ id, done: done[id] }));
}

export function checklistProgress(items) {
  const done = items.filter((item) => item.done).length;
  return { done, total: items.length, complete: done === items.length };
}
