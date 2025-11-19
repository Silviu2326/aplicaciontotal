import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InfiniteCalendar from '../components/calendar/InfiniteCalendar';
import StickyDayHeader from '../components/calendar/StickyDayHeader';
import QuickEventModal from '../components/calendar/QuickEventModal';
import { LifeTheme } from '../theme/LifeTheme';
import { useCalendar } from '../context/CalendarContext';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().split('T')[0];
  
  // selectedDate controls the Header display. 
  // InfiniteCalendar's internal scroll drives this via onDateChange.
  const [selectedDate, setSelectedDate] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { events, addEvent } = useCalendar();

  // Transform events to match what InfiniteCalendar/DayTimeline expects
  // Context provides: { start_time, end_time }
  // UI expects: { start, end } (Date objects or ISO strings that can be new Date()'d)
  const formattedEvents = useMemo(() => {
    const newEvents = {};
    Object.keys(events).forEach(dateKey => {
      newEvents[dateKey] = events[dateKey].map(e => ({
        ...e,
        start: e.start_time,
        end: e.end_time,
        color: e.color || LifeTheme.colors.work // Fallback color
      }));
    });
    return newEvents;
  }, [events]);

  // Events for the selected day (passed to modal for auto-scheduling collision detection)
  const currentDayEvents = useMemo(() => {
      return (formattedEvents[selectedDate] || []).map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
      }));
  }, [formattedEvents, selectedDate]);

  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
  };

  const handleSaveEvent = (newEvent) => {
    addEvent({
      title: newEvent.title,
      start_time: newEvent.start.toISOString(),
      end_time: newEvent.end.toISOString(),
      // Default values or inferred from context could go here
      calendar_id: 'local-1', 
    });
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <StickyDayHeader date={selectedDate} />

      {/* Calendar List */}
      <InfiniteCalendar 
        selectedDate={today} // Initial scroll position
        events={formattedEvents}
        onDateChange={handleDateChange}
        onEventPress={(event) => console.log('Event pressed:', event)}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={32} color={LifeTheme.colors.white} />
      </TouchableOpacity>

      {/* Modal */}
      <QuickEventModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        events={currentDayEvents}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LifeTheme.colors.neutralBg,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: LifeTheme.colors.neutralText, // Black/Dark FAB for contrast
    justifyContent: 'center',
    alignItems: 'center',
    ...LifeTheme.shadows.deep,
  }
});