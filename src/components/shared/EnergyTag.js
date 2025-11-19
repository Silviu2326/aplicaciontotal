import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LifeTheme } from '../../theme/LifeTheme';

const getEnergyConfig = (level) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return {
        color: LifeTheme.colors.energyHigh,
        icon: 'lightning-bolt',
        label: 'Alto',
        bgColor: 'rgba(255, 215, 0, 0.1)',
      };
    case 'medium':
      return {
        color: LifeTheme.colors.energyMedium,
        icon: 'lightning-bolt-outline',
        label: 'Medio',
        bgColor: 'rgba(59, 130, 246, 0.1)',
      };
    case 'low':
      return {
        color: LifeTheme.colors.energyLow,
        icon: 'battery-low',
        label: 'Bajo',
        bgColor: 'rgba(160, 174, 192, 0.1)',
      };
    default:
      return {
        color: LifeTheme.colors.neutralTextSecondary,
        icon: 'lightning-bolt-outline',
        label: 'Normal',
        bgColor: 'rgba(113, 128, 150, 0.1)',
      };
  }
};

const EnergyTag = ({ energy, style }) => {
  const config = getEnergyConfig(energy);

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.color }, style]}>
      <MaterialCommunityIcons name={config.icon} size={12} color={config.color} style={styles.icon} />
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

export default EnergyTag;
