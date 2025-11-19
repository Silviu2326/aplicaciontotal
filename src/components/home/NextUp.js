import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NextUp({ event }) {
  if (!event) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Siguiente Evento</Text>
      
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.timeContainer}>
            <Text style={styles.startTime}>{event.time}</Text>
            <Text style={styles.duration}>{event.duration}</Text>
            <View style={styles.verticalLine} />
        </View>
        
        <View style={styles.infoContainer}>
            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.row}>
                <Ionicons name="location-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                <Text style={styles.detail}>{event.location}</Text>
            </View>
            
            <View style={styles.attendees}>
                {event.attendees.map((initial, idx) => (
                    <View key={idx} style={[styles.avatar, { zIndex: 10 - idx, marginLeft: idx > 0 ? -8 : 0 }]}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                ))}
                {event.totalAttendees > 3 && (
                    <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -8, zIndex: 5 }]}>
                        <Text style={styles.moreText}>+{event.totalAttendees - 3}</Text>
                    </View>
                )}
            </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 50,
  },
  startTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  duration: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  verticalLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E5EA',
    marginTop: 8,
    borderRadius: 1,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detail: {
    fontSize: 13,
    color: '#666',
  },
  attendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1565C0',
  },
  moreAvatar: {
    backgroundColor: '#F5F5F5',
  },
  moreText: {
    fontSize: 10,
    color: '#666',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  }
});
