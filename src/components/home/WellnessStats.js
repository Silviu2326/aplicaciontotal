import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WellnessStats({ data }) {
  const { sleep, steps } = data;
  const stepPercent = Math.min((steps.current / steps.goal) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Salud & Bienestar</Text>
        <Ionicons name="heart-circle" size={24} color="#FF3B30" />
      </View>

      <View style={styles.row}>
        {/* Sleep Card */}
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="moon" size={20} color="#7C3AED" />
            </View>
            <View style={styles.dataContainer}>
                <Text style={styles.value}>{sleep.hours}<Text style={styles.unit}>h</Text></Text>
                <Text style={styles.label}>Sueño</Text>
            </View>
            <View style={styles.graphRow}>
                {[40, 60, 50, 85, 70, 60, 75].map((h, i) => (
                    <View key={i} style={[styles.bar, { height: h * 0.3, backgroundColor: i === 3 ? '#7C3AED' : '#E9D5FF' }]} />
                ))}
            </View>
        </View>

        {/* Steps Card */}
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="footsteps" size={20} color="#059669" />
            </View>
            <View style={styles.dataContainer}>
                <Text style={styles.value}>{(steps.current / 1000).toFixed(1)}<Text style={styles.unit}>k</Text></Text>
                <Text style={styles.label}>Pasos</Text>
            </View>
            
            <View style={styles.progressContainer}>
                <View style={styles.track} />
                <View style={[styles.fill, { width: `${stepPercent}%` }]} />
                <Text style={styles.percentText}>{Math.round(stepPercent)}%</Text>
            </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dataContainer: {
    marginBottom: 12,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  unit: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  // Sleep Bars
  graphRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 30,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  // Steps Progress
  progressContainer: {
    justifyContent: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#F0F2F5',
    borderRadius: 3,
    width: '100%',
    position: 'absolute',
  },
  fill: {
    height: 6,
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  percentText: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  }
});
