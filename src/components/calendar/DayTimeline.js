import React, { useMemo, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import TimeSlot from './TimeSlot';
import EventCard from './EventCard';
import { calculateEventLayouts } from '../../utils/calendarLayout';
import { LifeTheme } from '../../theme/LifeTheme';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i < 10 ? `0${i}:00` : `${i}:00`;
  return hour;
});

const DayTimeline = ({ events = [], onEventPress }) => {
  const [hourHeight, setHourHeight] = useState(60);
  const initialHeight = useRef(60);

  // Calculate layout only when events or hourHeight change
  const layoutEvents = useMemo(() => calculateEventLayouts(events, hourHeight), [events, hourHeight]);

  const onPinchStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.BEGAN) {
      initialHeight.current = hourHeight;
    }
  };

  const onPinchGestureEvent = ({ nativeEvent }) => {
    if (nativeEvent.scale) {
      const newHeight = initialHeight.current * nativeEvent.scale;
      // Clamp between 40 (compact) and 150 (zoomed in)
      setHourHeight(Math.max(40, Math.min(150, newHeight)));
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchStateChange}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Render Time Slots (Background Grid) */}
        <View style={styles.timeGrid}>
          {HOURS.map((time, index) => (
            <TimeSlot key={index} time={time} height={hourHeight} />
          ))}
        </View>

        {/* Render Events (Overlay) */}
        <View style={styles.eventsLayer}>
          {layoutEvents.map((event, index) => (
            <EventCard 
              key={event.id || index} 
              event={event}
              style={event.style}
              onPress={() => onEventPress && onEventPress(event)} 
            />
          ))}
        </View>
      </ScrollView>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LifeTheme.colors.neutralBg,
  },
  contentContainer: {
    paddingBottom: LifeTheme.spacing.xl,
  },
  timeGrid: {
    // The grid of time slots determines the total height
  },
  eventsLayer: {
    ...StyleSheet.absoluteFillObject,
    // Align with the divider part of the TimeSlot
    // PaddingLeft (16) + TimeText (60) + MarginLeft (8) = 84
    marginLeft: 84, 
    marginRight: LifeTheme.spacing.m, // Add right padding so it doesn't touch the edge
  },
});

export default DayTimeline;