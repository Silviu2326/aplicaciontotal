import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardSummary({ data }) {
  const { user, date, weather, widgets } = data;

  // Time-based greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        {/* Header Top Row */}
        <View style={styles.headerRow}>
            <View style={styles.userInfo}>
                <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8}>
                    <Text style={styles.avatarText}>{user.name[0]}</Text>
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}, {user.name}</Text>
                    <Text style={styles.date}>{date.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.weatherPill}>
                <Ionicons name={weather.icon} size={18} color="#fff" />
                <Text style={styles.weatherText}>{weather.temp}</Text>
            </View>
        </View>

        {/* Stats Grid (Replaces ScrollView for stability and look) */}
        <View style={styles.statsGrid}>
            {widgets.map((widget) => (
                <View key={widget.id} style={styles.statItem}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                         <Ionicons name={widget.icon} size={20} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.statValue}>{widget.value}</Text>
                        <Text style={styles.statLabel}>{widget.title}</Text>
                    </View>
                </View>
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
  },
  heroCard: {
    backgroundColor: '#2563EB', // Primary Blue
    borderRadius: 32,
    padding: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  weatherText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    width: '47%', // 2 columns
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  }
});


