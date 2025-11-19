import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationPreview({ notifications }) {
  const getIcon = (type) => {
    switch (type) {
      case 'urgent': return 'alert-circle';
      case 'warning': return 'time';
      default: return 'notifications';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'urgent': return '#D32F2F';
      case 'warning': return '#F57C00';
      default: return '#2563EB';
    }
  };

  const getBgStyle = (type) => {
      switch (type) {
      case 'urgent': return styles.urgentItem;
      default: return styles.normalItem;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Avisos</Text>
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
        </View>
      </View>
      
      {notifications.map((notif) => (
        <TouchableOpacity key={notif.id} style={[styles.item, getBgStyle(notif.type)]} activeOpacity={0.8}>
            <View style={[styles.iconBox, { backgroundColor: getColor(notif.type) + '15' }]}>
                <Ionicons name={getIcon(notif.type)} size={20} color={getColor(notif.type)} />
            </View>
            <View style={styles.content}>
                <Text style={styles.itemText}>{notif.title}</Text>
                <Text style={styles.itemSubtext}>{notif.subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: getColor(notif.type) }]}>{notif.action}</Text>
            </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  normalItem: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  urgentItem: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemSubtext: {
    fontSize: 13,
    color: '#666',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  actionText: {
    fontWeight: '600',
    fontSize: 12,
  }
});
