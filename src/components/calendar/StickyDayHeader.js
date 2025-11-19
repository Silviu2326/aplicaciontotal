import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LifeTheme } from '../../theme/LifeTheme';
import { Title, Subtitle } from '../shared/Typography';

const StickyDayHeader = ({ date = new Date() }) => {
  // Ensure date is a Date object
  const validDate = new Date(date);

  // Format parts of the date using native Intl
  const dayOfWeek = validDate.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayNumber = validDate.getDate();
  const month = validDate.toLocaleDateString('es-ES', { month: 'long' });

  // Capitalize first letter
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Simulated weather data
  // In a real app, this would come from a weather context or prop
  const weatherIcon = 'weather-partly-cloudy';
  const temp = '22°';

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Title style={styles.dayOfWeek}>{capitalize(dayOfWeek)}</Title>
        <Subtitle style={styles.fullDate}>
          {dayNumber} de {capitalize(month)}
        </Subtitle>
      </View>
      
      <View style={styles.weatherContainer}>
        <MaterialCommunityIcons 
          name={weatherIcon} 
          size={28} 
          color={LifeTheme.colors.neutralTextSecondary} 
        />
        <Subtitle style={styles.tempText}>{temp}</Subtitle>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LifeTheme.spacing.m,
    paddingVertical: LifeTheme.spacing.s,
    backgroundColor: LifeTheme.glass.bg, // Use glass background
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    // Sticky positioning properties for potential parent usage, 
    // though normally handled by the list header component
    zIndex: 10,
    ...Platform.select({
      ios: {
        backdropFilter: 'blur(10px)', // for web/expo-blur simulations if supported
      },
    }),
  },
  dateContainer: {
    flexDirection: 'column',
  },
  dayOfWeek: {
    fontSize: 28, // Larger than standard title for emphasis
    marginBottom: 0,
    color: LifeTheme.colors.neutralText,
    textTransform: 'capitalize',
  },
  fullDate: {
    fontSize: 14,
    marginBottom: 0,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LifeTheme.borderRadius.full,
  },
  tempText: {
    marginLeft: 6,
    marginBottom: 0,
    fontSize: 16,
    color: LifeTheme.colors.neutralText,
    fontWeight: '600',
  },
});

export default StickyDayHeader;
