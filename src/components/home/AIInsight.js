import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIInsight() {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.iconBox}>
            <Ionicons name="sparkles" size={18} color="#fff" />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.title}>Insight del Día</Text>
            <Text style={styles.message}>
                Tu productividad es 15% mayor por las mañanas. Sugerencia: Mueve "Estudiar Matemáticas" a las 9:00 AM.
            </Text>
        </View>
        <TouchableOpacity>
            <Ionicons name="close" size={16} color="#8E8E93" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  bubble: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF', // Very light blue
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0EA5E9', // Sky blue
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
});
