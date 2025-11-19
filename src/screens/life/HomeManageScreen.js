import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  ScrollView,
  Platform,
  Linking
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#8B5CF6';

// --- MOCK DATA ---
const ROOMS = [
  { id: 'Todo', name: 'Todo', icon: 'home-variant-outline' },
  { id: 'Cocina', name: 'Cocina', icon: 'fridge-outline' },
  { id: 'Baño', name: 'Baño', icon: 'shower' },
  { id: 'Limpieza', name: 'Limpieza', icon: 'bucket-outline' },
  { id: 'Sala', name: 'Sala', icon: 'sofa-outline' },
];

const SHOPPING_LIST = [
  { id: 's1', name: 'Leche Entera', quantity: '2 L', checked: false },
  { id: 's2', name: 'Huevos Campero', quantity: '12 un', checked: false },
  { id: 's3', name: 'Detergente', quantity: '1 bot', checked: false },
];

const INVENTORY_DATA = [
  { id: 'i1', name: 'Arroz Basmati', category: 'Cocina', stock: 2, unit: 'kg', icon: 'rice' },
  { id: 'i2', name: 'Pasta', category: 'Cocina', stock: 4, unit: 'paq', icon: 'pasta' },
  { id: 'i3', name: 'Aceite de Oliva', category: 'Cocina', stock: 1, unit: 'L', icon: 'oil' },
  { id: 'i4', name: 'Café Molido', category: 'Cocina', stock: 0, unit: 'paq', icon: 'coffee-outline' },
  { id: 'i5', name: 'Detergente Ropa', category: 'Limpieza', stock: 1, unit: 'bot', icon: 'bottle-tonic-plus-outline' },
  { id: 'i6', name: 'Suavizante', category: 'Limpieza', stock: 2, unit: 'bot', icon: 'bottle-tonic-outline' },
  { id: 'i8', name: 'Champú', category: 'Baño', stock: 1, unit: 'bot', icon: 'hair-dryer-outline' },
  { id: 'i9', name: 'Gel de Ducha', category: 'Baño', stock: 3, unit: 'bot', icon: 'shower-head' },
  { id: 'i10', name: 'Pasta Dental', category: 'Baño', stock: 0, unit: 'tubo', icon: 'tooth-outline' },
  { id: 'i11', name: 'Papel Higiénico', category: 'Baño', stock: 6, unit: 'rollo', icon: 'paper-roll-outline' },
];

const BILL_HISTORY = [
  { month: 'May', light: 45, water: 20, internet: 30 },
  { month: 'Jun', light: 42, water: 22, internet: 30 },
  { month: 'Jul', light: 55, water: 25, internet: 30 },
  { month: 'Ago', light: 60, water: 28, internet: 30 },
  { month: 'Sep', light: 48, water: 21, internet: 30 },
  { month: 'Oct', light: 50, water: 19, internet: 30 },
];

const FAMILY_NOTES = [
  { id: 'n1', author: 'Mamá', text: 'Cena en el horno, calentar a 180º', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'n2', author: 'Papá', text: 'Fontanero viene el Martes a las 10h', color: '#DBEAFE', textColor: '#1E40AF' },
  { id: 'n3', author: 'Hijo', text: 'Necesito el coche el viernes noche', color: '#D1FAE5', textColor: '#065F46' },
];

const SERVICE_CONTACTS = [
  { id: 'c1', name: 'Juan Electricista', role: 'Reparaciones', phone: '600123456', icon: 'lightning-bolt' },
  { id: 'c2', name: 'Fontanería Rápida', role: 'Urgencias 24h', phone: '900900900', icon: 'water-pump' },
  { id: 'c3', name: 'Soporte Internet', role: 'Fibra 1Gb', phone: '1004', icon: 'wifi' },
];

// --- SESSION STATE (In-Memory Persistence) ---
// This prevents data loss when navigating away from the screen
let sessionInventory = [...INVENTORY_DATA];
let sessionShoppingList = [...SHOPPING_LIST];

export default function HomeManageScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedRoom, setSelectedRoom] = useState('Todo');
  // Initialize state from session variables
  const [inventory, setInventory] = useState(sessionInventory);
  const [shoppingList, setShoppingList] = useState(sessionShoppingList);

  // Filter Inventory
  const filteredInventory = inventory.filter(item => 
    selectedRoom === 'Todo' || item.category === selectedRoom
  );

  // Handlers
  const updateStock = (id, delta) => {
    const newInventory = inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + delta);
        return { ...item, stock: newStock };
      }
      return item;
    });
    
    setInventory(newInventory);
    sessionInventory = newInventory; // Update session storage
  };

  const toggleShoppingItem = (id) => {
    const newList = shoppingList.map(item => {
      if (item.id === id) return { ...item, checked: !item.checked };
      return item;
    });
    
    setShoppingList(newList);
    sessionShoppingList = newList; // Update session storage
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Agotado', color: '#EF4444', bg: '#FEF2F2', icon: 'alert-circle-outline' };
    if (stock <= 2) return { label: 'Bajo', color: '#F59E0B', bg: '#FFFBEB', icon: 'alert-outline' };
    return { label: 'Bien', color: '#10B981', bg: '#ECFDF5', icon: 'check-circle-outline' };
  };

  const callContact = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(err => 
      Alert.alert('Error', 'No se pudo abrir el marcador telefónico')
    );
  };

  // Components
  const renderRoomSelector = () => (
    <View style={styles.roomSelectorContainer}>
      <FlatList
        data={ROOMS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomList}
        extraData={selectedRoom} // FIX: Ensures re-render on selection change
        renderItem={({ item }) => {
          const isSelected = selectedRoom === item.id;
          return (
            <TouchableOpacity 
              style={[styles.roomItem, isSelected && styles.roomItemActive]}
              onPress={() => setSelectedRoom(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={item.icon} 
                size={24} 
                color={isSelected ? '#FFF' : '#64748B'} 
              />
              <Text style={[styles.roomName, isSelected && styles.roomNameActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={item => item.id}
      />
    </View>
  );

  const renderShoppingItem = ({ item }) => (
    <View style={styles.shoppingItemContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 60 }}
      >
        <View style={styles.shoppingCard}>
          <View style={[styles.checkCircle, item.checked && styles.checkCircleActive]}>
             {item.checked && <MaterialCommunityIcons name="check" size={14} color="#FFF" />}
          </View>
          <View>
            <Text style={[styles.shoppingName, item.checked && styles.textStrikethrough]}>{item.name}</Text>
            <Text style={styles.shoppingQty}>{item.quantity}</Text>
          </View>
        </View>
        
        {/* Swipe Action Mock */}
        <TouchableOpacity 
          style={styles.swipeAction} 
          onPress={() => toggleShoppingItem(item.id)}
        >
          <MaterialCommunityIcons name={item.checked ? "undo" : "check"} size={24} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderInventoryCard = ({ item }) => {
    const status = getStockStatus(item.stock);
    return (
      <View style={styles.smartCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
            <MaterialCommunityIcons name={item.icon} size={24} color="#475569" />
          </View>
          <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
            <MaterialCommunityIcons name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemMeta}>{item.category} • {item.unit}</Text>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.stepBtn} 
            onPress={() => updateStock(item.id, -1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="minus" size={20} color="#64748B" />
          </TouchableOpacity>
          
          <Text style={[styles.stockNum, item.stock === 0 && { color: '#EF4444' }]}>
            {item.stock}
          </Text>

          <TouchableOpacity 
            style={[styles.stepBtn, { backgroundColor: THEME_COLOR + '15' }]} 
            onPress={() => updateStock(item.id, 1)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="plus" size={20} color={THEME_COLOR} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBillHistory = () => {
    const maxTotal = Math.max(...BILL_HISTORY.map(b => b.light + b.water + b.internet));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Luz</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Agua</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Net</Text>
          </View>
        </View>
        
        <View style={styles.barsRow}>
          {BILL_HISTORY.map((item, index) => {
            const total = item.light + item.water + item.internet;
            const heightPercent = (total / maxTotal) * 100;
            
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barStackContainer}>
                  <View style={[styles.barSegment, { height: (item.internet / total) * heightPercent + '%', backgroundColor: '#8B5CF6', borderTopLeftRadius: 4, borderTopRightRadius: 4 }]} />
                  <View style={[styles.barSegment, { height: (item.water / total) * heightPercent + '%', backgroundColor: '#3B82F6' }]} />
                  <View style={[styles.barSegment, { height: (item.light / total) * heightPercent + '%', backgroundColor: '#F59E0B', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
                <Text style={styles.barValue}>{total}€</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderFamilyBoard = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}>
      {FAMILY_NOTES.map(note => (
        <View key={note.id} style={[styles.noteCard, { backgroundColor: note.color }]}>
          <View style={styles.pinIcon}>
             <MaterialCommunityIcons name="pin" size={16} color={note.textColor} style={{ opacity: 0.5 }} />
          </View>
          <Text style={[styles.noteText, { color: note.textColor }]}>{note.text}</Text>
          <View style={styles.noteFooter}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: note.textColor }]}>
              <Text style={styles.avatarText}>{note.author.charAt(0)}</Text>
            </View>
            <Text style={[styles.noteAuthor, { color: note.textColor }]}>{note.author}</Text>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addNoteCard}>
        <MaterialCommunityIcons name="plus" size={30} color="#94A3B8" />
        <Text style={styles.addNoteText}>Nueva Nota</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderServiceContacts = () => (
    <View style={styles.contactsGrid}>
      {SERVICE_CONTACTS.map(contact => (
        <TouchableOpacity key={contact.id} style={styles.contactCard} onPress={() => callContact(contact.phone)}>
          <View style={styles.contactIconBox}>
            <MaterialCommunityIcons name={contact.icon} size={24} color="#64748B" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactRole}>{contact.role}</Text>
          </View>
          <View style={styles.callBtn}>
            <MaterialCommunityIcons name="phone" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión Hogar</Text>
          <TouchableOpacity style={styles.headerAction}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>
        
        {/* Room Selector in Header Area */}
        {renderRoomSelector()}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shopping List Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lista de Compras</Text>
            <Text style={styles.hintText}>Desliza para completar</Text>
          </View>
          <View style={{ gap: 10 }}>
            {shoppingList.map(item => (
              <View key={item.id}>
                {renderShoppingItem({ item })}
              </View>
            ))}
          </View>
        </View>

        {/* NEW: Family Board */}
        <View style={[styles.section, { paddingHorizontal: 0 }]}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>Tablón Familiar</Text>
          {renderFamilyBoard()}
        </View>

        {/* NEW: Bill History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Facturas</Text>
          {renderBillHistory()}
        </View>

        {/* NEW: Service Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactos de Servicio</Text>
          {renderServiceContacts()}
        </View>

        {/* Inventory Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventario {selectedRoom !== 'Todo' ? `(${selectedRoom})` : ''}</Text>
          <View style={styles.gridContainer}>
            {filteredInventory.map(item => (
              <View key={item.id} style={styles.gridItemWrapper}>
                {renderInventoryCard({ item })}
              </View>
            ))}
          </View>
          {filteredInventory.length === 0 && (
             <View style={styles.emptyState}>
                <MaterialCommunityIcons name="package-variant-closed" size={40} color="#CBD5E1" />
                <Text style={styles.emptyText}>No hay items en {selectedRoom}</Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.9}
      >
        <MaterialCommunityIcons name="barcode-scan" size={26} color="#fff" />
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerAction: {
    padding: 4,
    marginRight: -4,
  },
  // Room Selector
  roomSelectorContainer: {
    paddingLeft: 20,
  },
  roomList: {
    paddingRight: 20,
    gap: 12,
  },
  roomItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 80,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roomItemActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  roomName: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roomNameActive: {
    color: '#fff',
  },
  // Content
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  // Shopping List
  shoppingItemContainer: {
    height: 60,
    marginBottom: 4,
  },
  shoppingCard: {
    width: width - 40,
    height: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginRight: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  shoppingName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  textStrikethrough: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  shoppingQty: {
    fontSize: 12,
    color: '#64748B',
  },
  swipeAction: {
    width: 60,
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Inventory Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  smartCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 4,
    borderRadius: 12,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  stockNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
  // --- NEW STYLES ---
  // Bill History
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barColumn: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barStackContainer: {
    width: 12,
    height: '80%',
    justifyContent: 'flex-end',
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  barSegment: {
    width: '100%',
  },
  barLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    position: 'absolute',
    top: 0,
  },

  // Family Board
  noteCard: {
    width: 140,
    height: 140,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
    transform: [{ rotate: '-1deg' }],
  },
  pinIcon: {
    alignSelf: 'center',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000', // Overridden by opacity/color logic usually
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: '600',
  },
  addNoteCard: {
    width: 100,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Service Contacts
  contactsGrid: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  contactRole: {
    fontSize: 12,
    color: '#64748B',
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});