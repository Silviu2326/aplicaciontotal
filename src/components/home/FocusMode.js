import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FocusMode({ data }) {
  const { timer, tasks, nextAction } = data;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header / Timer Area */}
        <View style={styles.topSection}>
            <View style={styles.headerRow}>
                <View style={styles.badge}>
                    <Ionicons name="flash" size={16} color="#F59E0B" />
                    <Text style={styles.badgeText}>FOCUS MODE</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
            </View>

            <View style={styles.timerWrapper}>
                <Text style={styles.timerValue}>{timer}</Text>
                <View style={styles.controls}>
                     <TouchableOpacity style={styles.playBtn}>
                        <Ionicons name="play" size={24} color="#0F172A" style={{ marginLeft: 2 }} />
                     </TouchableOpacity>
                </View>
            </View>
        </View>

        {/* Tasks Area */}
        <View style={styles.bottomSection}>
            <Text style={styles.sectionTitle}>Sesión Actual</Text>
            <View style={styles.taskList}>
                {tasks.map((task, idx) => (
                <View key={task.id} style={[styles.taskRow, idx !== tasks.length - 1 && styles.borderBottom]}>
                    <TouchableOpacity style={styles.checkBox}>
                        {task.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </TouchableOpacity>
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskTime}>{task.duration}</Text>
                </View>
                ))}
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
  card: {
    backgroundColor: '#0F172A', // Midnight Blue
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  topSection: {
    padding: 24,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // Amber tint
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  badgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  timerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  bottomSection: {
    backgroundColor: '#1E293B', // Slightly lighter dark
    padding: 24,
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  taskList: {
    gap: 0,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 12,
  },
  taskTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  }
});
