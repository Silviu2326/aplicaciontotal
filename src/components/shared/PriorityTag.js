import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifeTheme } from '../../theme/LifeTheme';

const getPriorityConfig = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return {
        color: LifeTheme.colors.danger,
        icon: 'alert-circle',
        label: 'Alta',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    case 'medium':
      return {
        color: LifeTheme.colors.warning,
        icon: 'alert-circle-outline',
        label: 'Media',
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    case 'low':
      return {
        color: LifeTheme.colors.success,
        icon: 'arrow-down-circle-outline',
        label: 'Baja',
        bgColor: 'rgba(16, 185, 129, 0.1)',
      };
    default:
      return {
        color: LifeTheme.colors.neutralTextSecondary,
        icon: 'remove-circle-outline',
        label: 'Normal',
        bgColor: 'rgba(113, 128, 150, 0.1)',
      };
  }
};

const PriorityTag = ({ priority, style }) => {
  const config = getPriorityConfig(priority);

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.color }, style]}>
      <Ionicons name={config.icon} size={12} color={config.color} style={styles.icon} />
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LifeTheme.borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default PriorityTag;
