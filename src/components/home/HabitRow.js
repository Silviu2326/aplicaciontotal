import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HabitRow({ habits }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Hábitos Diarios</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {habits.map((habit) => (
          <TouchableOpacity key={habit.id} style={styles.habitItem} activeOpacity={0.7}>
            <View style={[styles.iconCircle, habit.completed ? styles.completed : styles.pending]}>
              <Ionicons 
                name={habit.completed ? 'checkmark' : habit.icon} 
                size={24} 
                color={habit.completed ? '#fff' : '#666'} 
              />
            </View>
            <Text style={styles.habitLabel}>{habit.title}</Text>
          </TouchableOpacity>
        ))}
        
        {/* Add button placeholder */}
        <TouchableOpacity style={styles.habitItem}>
            <View style={[styles.iconCircle, styles.addButton]}>
                <Ionicons name="add" size={24} color="#007AFF" />
            </View>
            <Text style={styles.habitLabel}>Nuevo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  habitItem: {
    alignItems: 'center',
    width: 60,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pending: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  completed: {
    backgroundColor: '#4CAF50', // Green success
  },
  addButton: {
    backgroundColor: '#F5F7FA',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  habitLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});
