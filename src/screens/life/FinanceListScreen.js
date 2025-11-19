import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- MOCK DATA FACTORY ---
const getMockData = (type) => {
  switch(type) {
    case 'bills':
      return [
        { id: '1', title: 'Alquiler', subtitle: '01 Dic', value: '-850€', icon: 'home-city', color: '#F59E0B' },
        { id: '2', title: 'Luz', subtitle: '05 Dic', value: '-45€', icon: 'lightning-bolt', color: '#F59E0B' },
        { id: '3', title: 'Internet', subtitle: '20 Nov', value: '-40€', icon: 'wifi', color: '#EF4444' }, // Overdue
      ];
    case 'goals':
      return [
        { id: '1', title: 'Viaje Japón', subtitle: '2500 / 4000€', value: '62%', icon: 'airplane', color: '#F43F5E' },
        { id: '2', title: 'MacBook', subtitle: '1200 / 2500€', value: '48%', icon: 'laptop', color: '#10B981' },
      ];
    default:
      return [
        { id: '1', title: 'Mercadona', subtitle: 'Hoy', value: '-85€', icon: 'cart', color: '#64748B' },
        { id: '2', title: 'Nómina', subtitle: 'Ayer', value: '+2400€', icon: 'cash', color: '#10B981' },
      ];
  }
};

const getTitle = (type) => {
  const titles = {
    bills: 'Mis Recibos',
    goals: 'Metas de Ahorro',
    transactions: 'Movimientos'
  };
  return titles[type] || 'Lista';
};

export default function FinanceListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { type = 'transactions' } = route.params || {};
  const data = getMockData(type);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle(type)}</Text>
          <View style={{ width: 40 }} /> 
        </View>
      </View>

      {/* List */}
      <FlatList
        data={data}
        contentContainerStyle={{ padding: 20 }}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} activeOpacity={0.7}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.itemValue}>{item.value}</Text>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={() => {
           // Logic to add new item based on type
           if (type === 'transactions') {
             navigation.navigate('TransactionForm', { type: 'expense' });
           }
        }}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
