/**
 * AI Scheduler Utility
 * Logic for finding optimal time slots within a calendar schedule.
 */

/**
 * Finds the first available time slot of a given duration within a day's events.
 * 
 * @param {number} durationMinutes - The duration of the task in minutes.
 * @param {Array} eventsForDay - Array of event objects { start, end } for the target day.
 * @returns {Date|null} - The start time of the found slot, or null if no slot is found.
 */
export const findBestSlot = (durationMinutes, eventsForDay) => {
  const DAY_START_HOUR = 8; // 08:00 AM
  const DAY_END_HOUR = 22;  // 10:00 PM

  // If no events provided, we can't reliably determine the target date.
  // However, in a real app, we'd likely pass the target date. 
  // Here we assume if list is empty, we might be checking "today" or simply can't suggest without a reference.
  // To be safe, if empty, we return null or a default 'today' start.
  // Let's try to infer from the list, otherwise default to Today.
  
  let referenceDate = new Date();
  const sortedEvents = (eventsForDay || [])
    .map(e => ({
      ...e,
      start: new Date(e.start),
      end: new Date(e.end)
    }))
    .sort((a, b) => a.start - b.start);

  if (sortedEvents.length > 0) {
    referenceDate = new Date(sortedEvents[0].start);
  }

  // Set boundaries for the day
  const searchStart = new Date(referenceDate);
  searchStart.setHours(DAY_START_HOUR, 0, 0, 0);

  const searchEnd = new Date(referenceDate);
  searchEnd.setHours(DAY_END_HOUR, 0, 0, 0);

  // If the first event starts way after searchStart, the first slot is searchStart
  // We iterate to find the first gap.
  
  let currentTime = searchStart;

  for (const event of sortedEvents) {
    // If event ends before our search window starts, ignore it (shouldn't happen if filtered correctly)
    if (event.end <= currentTime) continue;

    // Calculate gap between currentTime and event start
    // If event starts before currentTime (overlap), gap is negative/zero
    const gapStart = currentTime;
    const gapEnd = event.start < currentTime ? currentTime : event.start; // Clamp

    const gapDurationMs = gapEnd - gapStart;
    const gapMinutes = gapDurationMs / (1000 * 60);

    if (gapMinutes >= durationMinutes) {
      return gapStart; // Found the first suitable slot
    }

    // Move current time pointer to the end of this event
    // Only move forward
    if (event.end > currentTime) {
      currentTime = event.end;
    }
  }

  // Check for a final slot after the last event until the end of the day
  const finalGapMs = searchEnd - currentTime;
  const finalGapMinutes = finalGapMs / (1000 * 60);

  if (finalGapMinutes >= durationMinutes) {
    return currentTime;
  }

  return null; // No suitable slot found
};
