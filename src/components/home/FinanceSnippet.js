import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FinanceSnippet({ data }) {
  const { spent, limit, currency } = data;
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOverLimit = spent > limit;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Presupuesto Diario</Text>
        <Text style={styles.values}>
          <Text style={styles.spent}>{currency}{spent}</Text>
          <Text style={styles.limit}> / {currency}{limit}</Text>
        </Text>
      </View>

      <View style={styles.progressBarBg}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${percentage}%`, backgroundColor: isOverLimit ? '#FF3B30' : '#34C759' }
          ]} 
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.statusText}>
          {isOverLimit ? 'Has excedido tu límite diario' : 'Vas bien por hoy'}
        </Text>
        <Ionicons 
            name={isOverLimit ? "alert-circle" : "trending-up"} 
            size={16} 
            color={isOverLimit ? '#FF3B30' : '#34C759'} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  values: {
    fontSize: 14,
  },
  spent: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  limit: {
    color: '#8E8E93',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  }
});
