import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LifeTheme } from '../../theme/LifeTheme';
import { triggerImpact } from '../../utils/Haptics';

const TimeSlot = ({ time, onPress, onLongPress, height = 60 }) => {
  const handleLongPress = () => {
    triggerImpact('Medium');
    if (onLongPress) {
      onLongPress(time);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { height }]} 
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={300} // Standard delay
    >
      <View style={styles.timeSlot}>
        <Text style={styles.timeText}>{time}</Text>
        <View style={styles.divider} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // Fixed height as requested
    justifyContent: 'center',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: LifeTheme.spacing.medium,
  },
  timeText: {
    ...LifeTheme.typography.body,
    color: LifeTheme.colors.neutralTextSecondary,
    width: 60, // Give some fixed width for time display
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: LifeTheme.colors.border,
    marginLeft: LifeTheme.spacing.small,
  },
});

export default TimeSlot;
