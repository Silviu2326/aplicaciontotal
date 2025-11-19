import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from '../shared/GlassView';
import { LifeTheme } from '../../theme/LifeTheme';
import { useContextInfo } from '../../hooks/useContextInfo';

/**
 * EventCard Component
 * Displays an event in the calendar with a Bento-style design.
 * Now includes simulated context awareness (weather).
 * 
 * @param {Object} props
 * @param {Object} props.event - The event data (title, location, color, start, etc.)
 * @param {Object} props.style - Layout styles (top, left, height, width) passed from parent
 * @param {Function} props.onPress - Handler for card press
 */
const EventCard = ({ event, style, onPress }) => {
  const { title, location, color = LifeTheme.colors.neutralTextSecondary, start, status } = event;
  
  // Get context info (weather) based on event start time
  const { condition, temperature, loading } = useContextInfo(start);

  // Show weather icon only if it's rainy/stormy to reduce clutter, or if desired
  const isRainy = !loading && (condition === 'rainy' || condition === 'storm');
  const isCompleted = status === 'completed';

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.container, style, isCompleted && styles.completedContainer]}
      activeOpacity={0.7}
    >
      <GlassView 
        style={[
          styles.cardContent, 
          { borderLeftColor: isCompleted ? LifeTheme.colors.neutralTextSecondary : color, backgroundColor: isCompleted ? `${LifeTheme.colors.neutralTextSecondary}1A` : `${color}1A` } 
        ]}
        intensity={isCompleted ? 0.1 : 0.2}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, isCompleted && styles.completedText]} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          
          <View style={styles.detailsRow}>
            {location && (
              <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
                📍 {location}
              </Text>
            )}

            {isRainy && (
              <View style={styles.weatherContainer}>
                <Ionicons 
                  name={condition === 'storm' ? 'thunderstorm-outline' : 'rainy-outline'} 
                  size={12} 
                  color={LifeTheme.colors.info} 
                  style={styles.weatherIcon}
                />
                <Text style={styles.weatherText}>{temperature}</Text>
              </View>
            )}
          </View>
        </View>
      </GlassView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // Padding handled by the layout calculation usually, but if not, we might need padding here
    // For now, assume 'style' sets the exact bounding box.
    padding: 1, // Tiny gap between events if they touch
  },
  completedContainer: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
    borderLeftWidth: 4, // The "side status line"
    borderRadius: LifeTheme.borderRadius.sm, // Slightly smaller radius for calendar items often looks better
    padding: LifeTheme.spacing.s, // Compact padding
    justifyContent: 'center', // Center content vertically if height is small
    // Overriding GlassView default border to be cleaner
    borderWidth: 0,
    // But keeping the shadow from GlassView
  },
  textContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12, // Small font for calendar events
    fontWeight: '600',
    color: LifeTheme.colors.neutralText,
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: LifeTheme.colors.neutralTextSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 10,
    color: LifeTheme.colors.neutralTextSecondary,
    marginRight: 6,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  weatherIcon: {
    marginRight: 2,
  },
  weatherText: {
    fontSize: 10,
    color: LifeTheme.colors.neutralTextSecondary,
    fontWeight: '500',
  },
});

export default EventCard;