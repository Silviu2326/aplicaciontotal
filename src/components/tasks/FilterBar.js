import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native'; // Assuming @react-navigation/native is used for theming, or similar.
import { LifeTheme } from '../../theme/LifeTheme'; // Adjust path as necessary

const FilterBar = ({ filters, activeFilter, onSelectFilter }) => {
  const { colors } = useTheme(); // Use theme colors

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.chip,
            { backgroundColor: colors.card }, // Example: use card color for chip background
            activeFilter === filter && { backgroundColor: LifeTheme.colors.primary }, // Highlight active chip with primary color
          ]}
          onPress={() => onSelectFilter(filter)}
        >
          <Text
            style={[
              styles.chipText,
              { color: colors.text }, // Example: use text color for chip text
              activeFilter === filter && { color: LifeTheme.colors.card }, // Active chip text color
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chipText: {
    fontWeight: 'bold',
  },
});

export default FilterBar;
