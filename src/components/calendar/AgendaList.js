import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function AgendaList({ events, onEventPress }) {
  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay eventos para este día</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Agenda</Text>
        <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <TouchableOpacity style={[styles.item, { borderLeftColor: item.color }]} onPress={() => onEventPress(item)}>
            <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{item.time}</Text>
                <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventCategory}>{item.category}</Text>
            </View>
            </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 2.00,
    elevation: 2,
  },
  timeContainer: {
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  durationText: {
    fontSize: 12,
    color: '#999',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
