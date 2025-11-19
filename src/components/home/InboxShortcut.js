import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InboxShortcut({ inputTypes }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Captura Rápida</Text>
      
      <TouchableOpacity style={styles.inputBar} activeOpacity={0.9}>
        <View style={styles.plusIcon}>
            <Ionicons name="add" size={24} color="#fff" />
        </View>
        <Text style={styles.placeholder}>¿Qué tienes en mente?</Text>
        <Ionicons name="mic-outline" size={20} color="#8E8E93" style={{ marginRight: 8 }} />
      </TouchableOpacity>

      <View style={styles.chipsContainer}>
        {inputTypes.map((type, index) => (
            <TouchableOpacity key={index} style={styles.chip}>
                <Text style={styles.chipText}>{type}</Text>
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholder: {
    flex: 1,
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  }
});
