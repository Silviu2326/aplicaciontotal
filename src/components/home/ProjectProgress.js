import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectProgress({ project }) {
  const { title, subtitle, progress, dueDate, members } = project;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Proyecto Principal</Text>
        <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
                <Ionicons name="briefcase" size={20} color="#fff" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{dueDate}</Text>
            </View>
        </View>

        <View style={styles.progressSection}>
            <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progreso</Text>
                <Text style={styles.progressValue}>{progress}%</Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
        </View>

        <View style={styles.footer}>
            <View style={styles.avatars}>
                {members.map((img, idx) => (
                     <View key={idx} style={[styles.avatarCircle, { marginLeft: idx > 0 ? -10 : 0, zIndex: 10 - idx }]}>
                        {/* Placeholder for image */}
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#ccc', borderRadius: 12 }} /> 
                     </View>
                ))}
            </View>
            <TouchableOpacity style={styles.updateBtn}>
                <Text style={styles.updateText}>Actualizar</Text>
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  badge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  track: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatars: {
    flexDirection: 'row',
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  updateBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  updateText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  }
});
