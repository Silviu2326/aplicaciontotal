import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { View, FlatList, Dimensions, StyleSheet, Text } from 'react-native';
import DayTimeline from './DayTimeline';
import { LifeTheme } from '../../theme/LifeTheme';
import { triggerImpact } from '../../utils/Haptics';

// If available, use FlashList for better performance
// import { FlashList } from '@shopify/flash-list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const INITIAL_RANGE = 365; // Days before and after to render initially

const InfiniteCalendar = ({ 
  selectedDate = new Date(), 
  events = {}, // Dictionary: { 'YYYY-MM-DD': [Event objects...] }
  onDateChange,
  onEventPress 
}) => {
  const flatListRef = useRef(null);
  
  // Helper to format date as YYYY-MM-DD
  const getDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Generate the list of dates
  // centered around the selectedDate (or today)
  const data = useMemo(() => {
    const dates = [];
    const baseDate = new Date(selectedDate);
    
    // Generate past and future dates
    for (let i = -INITIAL_RANGE; i <= INITIAL_RANGE; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push({
        id: getDateKey(d),
        date: d,
        dateString: getDateKey(d),
        index: i + INITIAL_RANGE // store original index for reference
      });
    }
    return dates;
  }, []); // Stable dependency, assuming infinite scroll handling happens elsewhere or fixed range for MVP

  // Initial Scroll Index
  // We want to start at the middle (index 365)
  const initialScrollIndex = INITIAL_RANGE;

  const getItemLayout = (_, index) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  // Sync with external selectedDate changes
  useEffect(() => {
    if (!data.length) return;

    const dateKey = getDateKey(new Date(selectedDate));
    const targetIndex = data.findIndex(item => item.dateString === dateKey);

    if (targetIndex !== -1 && flatListRef.current) {
       // Check if we need to scroll (avoid loops/jumps if already there)
       // This is a bit tricky without current index state, but we can just check if the difference is significant
       // or use a ref to track the last reported index.
       // For now, we rely on the parent usually updating this prop.
       // To prevent jitter, we can check if the targetIndex is the one currently reported? 
       // Actually, let's just scroll. The key to avoiding jitter is usually 'animated: false' if it's a large jump,
       // or 'animated: true' for smooth transitions. The user requested "smooth".
       
       // However, if the user IS scrolling, we don't want to fight them.
       // We can't easily detect "user is touching" here without more state.
       // We will assume if the date changed substantially, we scroll.
       
       flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
    }
  }, [selectedDate, data]);

  // Handle Viewable Items to update header/selected date
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      
      // Only notify if it's actually different to avoid redundant updates
      // We need to compare with the PROP selectedDate to see if we need to fire the event
      const currentSelectedKey = getDateKey(new Date(selectedDate));
      
      if (item.dateString !== currentSelectedKey) {
        if (onDateChange) {
          triggerImpact('Light'); // Haptic feedback on day change
          onDateChange(item.dateString);
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Trigger when 50% of the item is visible
  }).current;

  // Render Item: The DayTimeline
  const renderItem = useCallback(({ item }) => {
    const dayEvents = events[item.dateString] || [];
    
    // Ensure events have full date objects if they don't already
    // (This depends on data source, assumes DayTimeline handles raw event objects compatible with calendarLayout)
    
    return (
      <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
        <DayTimeline 
          events={dayEvents} 
          onEventPress={onEventPress}
        />
      </View>
    );
  }, [events, onEventPress]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialScrollIndex}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Performance props
        removeClippedSubviews={true}
        windowSize={5} // Reduce window size to save memory
        maxToRenderPerBatch={3}
        initialNumToRender={3}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LifeTheme.colors.neutralBg,
  },
});

export default InfiniteCalendar;
