import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Initial state for the Calendar context.
 * 
 * @typedef {Object} CalendarState
 * @property {Object.<string, CalendarEvent[]>} events - Map of date strings (YYYY-MM-DD) to arrays of events.
 * @property {CalendarSource[]} calendars - Array of available calendar sources.
 */
export const initialCalendarState = {
  events: {},
  calendars: [
    {
      id: 'local-1',
      source_type: 'local',
      title: 'My Calendar',
      color: '#4F46E5', // Indigo
      is_visible: true,
      sync_token: null,
    },
    {
      id: 'work-1',
      source_type: 'google',
      title: 'Work',
      color: '#10B981', // Emerald
      is_visible: true,
      sync_token: 'abc-123',
    }
  ]
};

/**
 * Helper to generate the date key (YYYY-MM-DD) from an ISO string or Date object.
 */
const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  return date.toISOString().split('T')[0];
};

/**
 * Calendar Reducer
 * Handles actions for managing calendar events and sources.
 * 
 * Supported Actions:
 * - ADD_EVENT: Adds a new event to the correct date bucket.
 * - UPDATE_EVENT: Updates an event, moving it to a new date bucket if the date changed.
 * - DELETE_EVENT: Removes an event from its date bucket.
 * - SYNC_EXTERNAL_CALENDARS: Updates the list of calendar sources (placeholder).
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action object { type, payload }
 * @returns {Object} New state
 */
export const calendarReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_EVENT': {
      const newEvent = {
        id: action.payload.id || uuidv4(),
        calendar_id: action.payload.calendar_id || 'local-1',
        status: action.payload.status || 'confirmed',
        is_all_day: action.payload.is_all_day || false,
        title: action.payload.title || 'New Event',
        description: action.payload.description || '',
        start_time: action.payload.start_time, // Required
        end_time: action.payload.end_time,     // Required
        location_name: action.payload.location_name || '',
        recurrence_rule: action.payload.recurrence_rule || null,
        ...action.payload,
      };

      if (!newEvent.start_time) {
        console.warn('ADD_EVENT: start_time is required');
        return state;
      }

      const dateKey = getDateKey(newEvent.start_time);
      const currentDayEvents = state.events[dateKey] || [];

      return {
        ...state,
        events: {
          ...state.events,
          [dateKey]: [...currentDayEvents, newEvent],
        },
      };
    }

    case 'UPDATE_EVENT': {
      const { id, oldDateKey, updates } = action.payload;
      
      // We need to find the event first if oldDateKey isn't provided, 
      // but for performance, passing oldDateKey or the full old event is better.
      // Assuming payload might provide oldDateKey or we search for it.
      // If strict optimization is needed, we can enforce passing the old date.
      
      let sourceDateKey = oldDateKey;
      let eventToUpdate = null;

      // If oldDateKey is not provided, this is an expensive operation (scan all days)
      // Ideally, the UI should provide the date key where the event currently resides.
      if (!sourceDateKey) {
        for (const [key, dayEvents] of Object.entries(state.events)) {
          const found = dayEvents.find(e => e.id === id);
          if (found) {
            sourceDateKey = key;
            eventToUpdate = found;
            break;
          }
        }
      } else {
         eventToUpdate = state.events[sourceDateKey]?.find(e => e.id === id);
      }

      if (!eventToUpdate || !sourceDateKey) {
        console.warn(`UPDATE_EVENT: Event with id ${id} not found.`);
        return state;
      }

      const updatedEvent = { ...eventToUpdate, ...updates };
      const newDateKey = getDateKey(updatedEvent.start_time);

      // If the date hasn't changed, just update in place
      if (sourceDateKey === newDateKey) {
        return {
          ...state,
          events: {
            ...state.events,
            [sourceDateKey]: state.events[sourceDateKey].map(e => 
              e.id === id ? updatedEvent : e
            ),
          },
        };
      }

      // If date changed: Remove from old key, add to new key
      const oldDayEventsWithoutEvent = state.events[sourceDateKey].filter(e => e.id !== id);
      const newDayEvents = state.events[newDateKey] || [];

      const newEventsMap = {
        ...state.events,
        [sourceDateKey]: oldDayEventsWithoutEvent,
        [newDateKey]: [...newDayEvents, updatedEvent],
      };

      // Cleanup empty keys if desired, but not strictly necessary
      if (newEventsMap[sourceDateKey].length === 0) {
        delete newEventsMap[sourceDateKey];
      }

      return {
        ...state,
        events: newEventsMap,
      };
    }

    case 'DELETE_EVENT': {
      const { id, dateKey } = action.payload;
      
      let targetDateKey = dateKey;
      
      // Fallback search if dateKey not provided
      if (!targetDateKey) {
        for (const [key, dayEvents] of Object.entries(state.events)) {
          if (dayEvents.some(e => e.id === id)) {
            targetDateKey = key;
            break;
          }
        }
      }

      if (!targetDateKey || !state.events[targetDateKey]) {
        return state;
      }

      const filteredDayEvents = state.events[targetDateKey].filter(e => e.id !== id);
      
      const newEventsMap = {
        ...state.events,
        [targetDateKey]: filteredDayEvents,
      };

      if (filteredDayEvents.length === 0) {
        delete newEventsMap[targetDateKey];
      }

      return {
        ...state,
        events: newEventsMap,
      };
    }

    case 'SYNC_EXTERNAL_CALENDARS': {
      // Placeholder: In a real app, this might merge external events into the 'events' map
      // or update the 'calendars' list status.
      // Payload could be { calendars: [], events: [] }
      
      const externalEvents = action.payload.events || [];
      const updatedCalendars = action.payload.calendars || state.calendars;

      // Merging logic would be complex here (avoid duplicates, handle existing sync tokens)
      // For now, we'll just assume we are replacing/appending provided data.
      
      // Simple merge for events (naive implementation)
      const newEventsMap = { ...state.events };
      
      externalEvents.forEach(evt => {
        const dKey = getDateKey(evt.start_time);
        if (!newEventsMap[dKey]) newEventsMap[dKey] = [];
        // Check for duplicate ID before adding
        if (!newEventsMap[dKey].find(e => e.id === evt.id)) {
          newEventsMap[dKey].push(evt);
        }
      });

      return {
        ...state,
        calendars: updatedCalendars,
        events: newEventsMap,
      };
    }

    default:
      return state;
  }
};
