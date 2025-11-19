import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export const requestPermissions = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      return true;
    } else {
      console.warn('Calendar permissions not granted');
      return false;
    }
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

export const getCalendars = async () => {
  try {
    const permissions = await Calendar.getCalendarPermissionsAsync();
    if (permissions.status !== 'granted') {
      throw new Error('Calendar permissions missing');
    }
    
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    throw error;
  }
};

export const getEventsAsync = async (startDate, endDate) => {
  try {
    const permissions = await Calendar.getCalendarPermissionsAsync();
    if (permissions.status !== 'granted') {
       throw new Error('Calendar permissions missing');
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarIds = calendars.map(calendar => calendar.id);

    if (calendarIds.length === 0) {
        return [];
    }

    const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
    return events;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};
