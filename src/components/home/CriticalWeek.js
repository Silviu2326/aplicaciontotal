import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function CriticalWeek({ days }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Noviembre 2025</Text>
        <TouchableOpacity>
            <Text style={styles.subtitle}>Ver Calendario</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
                styles.dayCapsule, 
                item.isToday && styles.todayCapsule,
                item.status === 'warning' && !item.isToday && styles.warningCapsule
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayText, item.isToday && styles.textWhite]}>{item.day}</Text>
            <Text style={[styles.dateText, item.isToday && styles.textWhite]}>{item.date}</Text>
            
            {/* Status Dot */}
            <View style={[
                styles.dot, 
                item.status === 'busy' && { backgroundColor: item.isToday ? '#FF3B30' : '#d32f2f' },
                item.status === 'warning' && { backgroundColor: '#F57C00' },
                item.status === 'normal' && { backgroundColor: 'transparent' }
            ]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  dayCapsule: {
    width: 56,
    height: 85,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  todayCapsule: {
    backgroundColor: '#1A1A1A', // Dark highlighting for today
    borderColor: '#1A1A1A',
    transform: [{ scale: 1.05 }], // Slightly larger
    shadowOpacity: 0.2,
  },
  warningCapsule: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFE0B2',
  },
  dayText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  textWhite: {
    color: '#fff',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  }
});

