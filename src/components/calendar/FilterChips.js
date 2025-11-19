import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function FilterChips({ filters, activeFilter, onFilterPress }) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <TouchableOpacity 
            style={[styles.chip, activeFilter === 'all' && styles.activeChip]}
            onPress={() => onFilterPress('all')}
        >
            <Text style={[styles.chipText, activeFilter === 'all' && styles.activeChipText]}>Todos</Text>
        </TouchableOpacity>

        {filters.map((filter) => (
          <TouchableOpacity 
            key={filter.id} 
            style={[
                styles.chip, 
                activeFilter === filter.id && { backgroundColor: filter.color, borderColor: filter.color }
            ]}
            onPress={() => onFilterPress(filter.id)}
          >
            <Text style={[
                styles.chipText, 
                activeFilter === filter.id && styles.activeChipText
            ]}>
                {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  scroll: {
    paddingLeft: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeChipText: {
    color: '#fff',
  }
});
