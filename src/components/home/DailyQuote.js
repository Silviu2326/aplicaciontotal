import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DailyQuote({ quote, author }) {
  return (
    <View style={styles.container}>
      <View style={styles.quoteBox}>
        <Ionicons name="quote" size={24} color="rgba(255,255,255,0.2)" style={styles.quoteIcon} />
        <Text style={styles.text}>"{quote}"</Text>
        <Text style={styles.author}>— {author}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  quoteBox: {
    backgroundColor: '#343a40', // Dark elegant grey
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  quoteIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
    zIndex: 1,
  },
  author: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
