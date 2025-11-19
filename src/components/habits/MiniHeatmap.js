import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LifeTheme } from '../../theme/LifeTheme';

const MiniHeatmap = ({ history = [], color = LifeTheme.colors.work }) => {
  // Generate last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  return (
    <View style={styles.container}>
      {days.map((date, index) => {
        const isCompleted = history.includes(date);
        return (
          <View
            key={date}
            style={[
              styles.square,
              {
                backgroundColor: isCompleted ? color : '#E2E8F0', // Gray-200 for empty
                opacity: isCompleted ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4, // spacing.xs
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
});

export default MiniHeatmap;
