import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QuickGrid() {
  const actions = [
    { id: 1, label: 'Escanear', icon: 'scan', color: '#4F46E5', bg: '#EEF2FF' },
    { id: 2, label: 'Timer', icon: 'timer', color: '#EA580C', bg: '#FFF7ED' },
    { id: 3, label: 'Nota', icon: 'document-text', color: '#059669', bg: '#ECFDF5' },
    { id: 4, label: 'Llamar', icon: 'call', color: '#DB2777', bg: '#FDF2F8' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Atajos</Text>
      <View style={styles.grid}>
        {actions.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.item, { backgroundColor: item.bg }]} activeOpacity={0.7}>
            <Ionicons name={item.icon} size={24} color={item.color} />
            <Text style={[styles.label, { color: item.color }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  item: {
    width: '48%', // roughly half minus gap
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  }
});
