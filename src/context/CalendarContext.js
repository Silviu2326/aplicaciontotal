import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { requestPermissions, getEventsAsync } from '../services/NativeCalendarService';
import { useTasks } from './TaskContext';

// Initial state structure based on SQL schema from analysis_calendar.md

const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const { state: taskState, dispatch: taskDispatch } = useTasks();

  // Events: Map indexed by date string (YYYY-MM-DD) -> Array of event objects
  // Schema: id, calendar_id, title, description, start_time, end_time, is_all_day, 
  // location_name, location_coords, recurrence_rule, linked_task_id, linked_module, status
  const [events, setEvents] = useState({});

  // Calendars: Array of calendar sources
  // Schema: id, source_type, title, color, is_visible, sync_token
  const [calendars, setCalendars] = useState([
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
  ]);

  useEffect(() => {
    const syncNativeEvents = async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const now = new Date();
      // Range: 1 month back to 3 months forward
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0);

      try {
        const nativeEvents = await getEventsAsync(startDate, endDate);
        
        const newEventsByDate = {};

        nativeEvents.forEach(event => {
          // Normalize native event to local schema
          const normalizedEvent = {
            id: event.id,
            calendar_id: event.calendarId,
            title: event.title,
            description: event.notes || '',
            start_time: event.startDate,
            end_time: event.endDate,
            is_all_day: event.allDay,
            location_name: event.location || '',
            status: 'confirmed',
            source: 'native',
            recurrence_rule: event.recurrenceRule ? JSON.stringify(event.recurrenceRule) : null
          };

          // Create date key (YYYY-MM-DD)
          const startD = new Date(event.startDate);
          if (isNaN(startD.getTime())) return; // Skip invalid dates
          const dateKey = startD.toISOString().split('T')[0];
          
          if (!newEventsByDate[dateKey]) {
            newEventsByDate[dateKey] = [];
          }
          newEventsByDate[dateKey].push(normalizedEvent);
        });

        setEvents(prevEvents => {
          const mergedEvents = { ...prevEvents };
          
          Object.keys(newEventsByDate).forEach(dateKey => {
            const existing = mergedEvents[dateKey] || [];
            const incoming = newEventsByDate[dateKey];
            
            // Simple merge strategy: Filter out duplicates by ID
            const existingIds = new Set(existing.map(e => e.id));
            const uniqueIncoming = incoming.filter(e => !existingIds.has(e.id));
            
            if (uniqueIncoming.length > 0) {
              mergedEvents[dateKey] = [...existing, ...uniqueIncoming];
            }
          });
          
          return mergedEvents;
        });

      } catch (error) {
        console.error("Failed to sync native events", error);
      }
    };

    syncNativeEvents();
  }, []);

  // Helper to add an event
  const addEvent = (eventData) => {
    // Basic validation or default values could go here
    const newEvent = {
      id: Date.now().toString(), // Temporary ID generation
      calendar_id: 'local-1', // Default to local
      status: 'confirmed',
      is_all_day: false,
      ...eventData,
    };

    // Determine date key from start_time
    const startDate = new Date(newEvent.start_time);
    const dateKey = startDate.toISOString().split('T')[0];

    setEvents((prevEvents) => {
      const currentDayEvents = prevEvents[dateKey] || [];
      return {
        ...prevEvents,
        [dateKey]: [...currentDayEvents, newEvent],
      };
    });
  };

  // Helper to toggle calendar visibility
  const toggleCalendarVisibility = (calendarId) => {
    setCalendars((prevCalendars) =>
      prevCalendars.map((cal) =>
        cal.id === calendarId ? { ...cal, is_visible: !cal.is_visible } : cal
      )
    );
  };

  /**
   * Converts a Task to a Calendar Event (Time Blocking)
   * 
   * @param {string} taskId - The ID of the task to convert
   * @param {string} date - Date string in 'YYYY-MM-DD' format
   * @param {string} time - Time string in 'HH:mm' format
   */
  const convertTaskToEvent = (taskId, date, time) => {
    // 1. Find the task
    const task = taskState.tasks.find(t => t.id === taskId);
    if (!task) {
      console.warn(`convertTaskToEvent: Task with id ${taskId} not found.`);
      return;
    }

    // 2. Create Event Date Objects
    let startDateTime;
    try {
      // Robustly handle simple string concatenation for ISO-like construction
      // Assuming date is 'YYYY-MM-DD' and time is 'HH:mm'
      const dateTimeString = `${date}T${time}:00`;
      startDateTime = new Date(dateTimeString);
    } catch (e) {
      console.error("convertTaskToEvent: Invalid date/time format", e);
      return;
    }

    if (isNaN(startDateTime.getTime())) {
      console.error("convertTaskToEvent: Invalid start time constructed");
      return;
    }

    // Default duration 1 hour for time-blocked tasks
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    // 3. Add Event
    addEvent({
      title: task.title,
      description: task.notes,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      linked_task_id: taskId,
      status: 'confirmed',
      calendar_id: 'local-1' // Ensure it goes to the local calendar
    });

    // 4. Update Task Status
    taskDispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: {
          status: 'scheduled'
        }
      }
    });
  };

  // Context value
  const value = useMemo(() => ({
    events,
    calendars,
    addEvent,
    toggleCalendarVisibility,
    setEvents, // Expose setter for bulk updates/loading
    setCalendars,
    convertTaskToEvent
  }), [events, calendars, taskState.tasks]);

  // Sync Task Completion to Event Status
  useEffect(() => {
    if (!taskState.tasks || Object.keys(events).length === 0) return;

    let hasChanges = false;
    const newEvents = { ...events };

    Object.keys(newEvents).forEach(dateKey => {
      newEvents[dateKey] = newEvents[dateKey].map(event => {
        if (event.linked_task_id) {
          const linkedTask = taskState.tasks.find(t => t.id === event.linked_task_id);
          if (linkedTask && linkedTask.status === 'completed' && event.status !== 'completed') {
            hasChanges = true;
            return { ...event, status: 'completed' };
          } else if (linkedTask && linkedTask.status !== 'completed' && event.status === 'completed') {
             // Revert to confirmed if task is un-completed
             hasChanges = true;
             return { ...event, status: 'confirmed' };
          }
        }
        return event;
      });
    });

    if (hasChanges) {
      setEvents(newEvents);
    }
  }, [taskState.tasks]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
