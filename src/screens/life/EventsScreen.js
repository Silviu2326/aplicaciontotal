import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Platform,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- MOCK DATA ---
const INITIAL_EVENTS = [
  { id: '1', title: 'Cumpleaños de Ana', type: 'birthday', date: new Date(2025, 10, 25, 18, 30), person: 'Ana', gift: 'Libro de arte', color: '#F472B6', theme: 'party' },
  { id: '2', title: 'Aniversario', type: 'heart', date: new Date(2025, 10, 22, 20, 0), person: 'Pareja', gift: 'Reloj Vintage', color: '#E11D48', theme: 'romance' },
  { id: '3', title: 'Cena de Navidad', type: 'party-popper', date: new Date(2025, 11, 24, 21, 0), person: 'Familia', gift: 'Vino Gran Reserva', color: '#10B981', theme: 'holiday' },
  { id: '4', title: 'Boda de Carlos', type: 'ring', date: new Date(2026, 0, 10, 12, 0), person: 'Carlos & Maria', gift: 'Set de cuchillos', color: '#F59E0B', theme: 'elegant' },
  { id: '5', title: 'Viaje a Japón', type: 'airplane', date: new Date(2026, 2, 15, 8, 0), person: 'Amigos', gift: null, color: '#3B82F6', theme: 'adventure' },
];

const GIFT_IDEAS = [
  { id: 'g1', person: 'Ana', tags: ['Arte', 'Diseño', 'Gatos'], ideas: ['Acuarelas pro', 'Tote bag personalizada', 'Taza gato'] },
  { id: 'g2', person: 'Papá', tags: ['Tecnología', 'Vino'], ideas: ['Smartwatch', 'Decantador', 'Suscripción revista'] },
  { id: 'g3', person: 'Pareja', tags: ['Moda', 'Viajes'], ideas: ['Perfume', 'Escapada fin de semana', 'Cámara instantánea'] },
];

const PAST_MEMORIES = [
  { id: 'm1', title: 'Boda de Juan', date: 'Sept 2023', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80' },
  { id: 'm2', title: 'Cumpleaños 30', date: 'Feb 2024', image: 'https://images.unsplash.com/photo-1530103862676-de3c9a59aa38?w=400&q=80' },
  { id: 'm3', title: 'Navidad 2024', date: 'Dic 2024', image: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&q=80' },
];

const EVENT_BUDGET = {
  total: 6300,
  spent: 800,
  categories: [
    { id: 'b1', name: 'Lugar', estimated: 2000, spent: 500, color: '#6366F1' },
    { id: 'b2', name: 'Catering', estimated: 3500, spent: 0, color: '#EC4899' },
    { id: 'b3', name: 'Decoración', estimated: 800, spent: 300, color: '#10B981' },
  ]
};

const VENDORS = [
  { id: 'v1', name: 'DJ PartyKing', role: 'Música', phone: '+34 600 111 222', rating: 4.8, verified: true },
  { id: 'v2', name: 'Flores & Co', role: 'Florista', phone: '+34 600 333 444', rating: 4.9, verified: true },
  { id: 'v3', name: 'Chef Mario', role: 'Catering', phone: '+34 600 555 666', rating: 4.7, verified: false },
];

// --- HELPERS ---
const getTimeRemaining = (targetDate) => {
  const total = new Date(targetDate).getTime() - new Date().getTime();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
};

const formatDate = (date) => {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
};

const getThemeAssets = (type) => {
  switch (type) {
    case 'birthday':
    case 'party':
      return { bg: '#FFF5F7', pattern: 'circle', icon: 'balloon' };
    case 'heart':
    case 'romance':
      return { bg: '#FFF0F2', pattern: 'heart', icon: 'heart' };
    case 'ring':
    case 'elegant':
      return { bg: '#F8FAFC', pattern: 'diamond', icon: 'ring' };
    case 'party-popper':
    case 'holiday':
      return { bg: '#ECFDF5', pattern: 'star', icon: 'party-popper' };
    default:
      return { bg: '#F0F9FF', pattern: 'square', icon: 'calendar' };
  }
};

// --- CUSTOM HOOK ---
const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

// --- COMPONENTS ---

const AddEventModal = ({ visible, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [dateStr, setDateStr] = useState(''); // DD/MM/YYYY
  const [timeStr, setTimeStr] = useState(''); // HH:MM

  const handleSubmit = () => {
    if (!title || !dateStr) {
      Alert.alert('Error', 'Por favor completa el título y la fecha.');
      return;
    }

    // Simple validation and parsing
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      const [hours, minutes] = timeStr ? timeStr.split(':').map(Number) : [12, 0];
      
      if (!day || !month || !year) throw new Error('Fecha inválida');

      const date = new Date(year, month - 1, day, hours, minutes);
      
      onAdd({
        title,
        person: person || 'General',
        date,
        type: 'party', // Default to party for simplicity
        color: '#8B5CF6', // Default color
        theme: 'party'
      });
      
      // Reset form
      setTitle('');
      setPerson('');
      setDateStr('');
      setTimeStr('');
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Formato de fecha incorrecto. Usa DD/MM/YYYY.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo Evento</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Título del evento</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Cumpleaños de Mamá" 
              value={title} 
              onChangeText={setTitle} 
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Persona / Detalles</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Familia" 
              value={person} 
              onChangeText={setPerson} 
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Fecha (DD/MM/YYYY)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="25/12/2025" 
                value={dateStr} 
                onChangeText={setDateStr} 
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 0.6 }]}>
              <Text style={styles.label}>Hora (HH:MM)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="18:00" 
                value={timeStr} 
                onChangeText={setTimeStr} 
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
            <Text style={styles.saveBtnText}>Guardar Evento</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const DecorativeBackground = ({ type, color }) => {
  const { pattern } = getThemeAssets(type);
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pattern === 'circle' && (
        <>
          <View style={[styles.decoCircle, { top: -20, right: -20, backgroundColor: color, opacity: 0.1, width: 100, height: 100 }]} />
          <View style={[styles.decoCircle, { bottom: -10, left: 10, backgroundColor: color, opacity: 0.1, width: 60, height: 60 }]} />
        </>
      )}
      {pattern === 'heart' && (
        <>
           <MaterialCommunityIcons name="heart" size={100} color={color} style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }} />
        </>
      )}
      {pattern === 'diamond' && (
        <>
           <MaterialCommunityIcons name="diamond-stone" size={120} color={color} style={{ position: 'absolute', top: -40, right: -30, opacity: 0.05 }} />
        </>
      )}
      {pattern === 'star' && (
        <>
           <MaterialCommunityIcons name="star" size={80} color={color} style={{ position: 'absolute', top: 10, right: 10, opacity: 0.08 }} />
        </>
      )}
    </View>
  );
};

const DynamicCountdown = ({ event }) => {
  const timeLeft = useCountdown(event ? event.date : new Date());

  if (!event) return (
    <View style={[styles.countdownContainer, { opacity: 0.5 }]}>
      <View style={[styles.countdownCard, { backgroundColor: '#94A3B8', justifyContent:'center', alignItems:'center' }]}>
        <Text style={{color:'white', fontWeight:'bold'}}>No hay eventos próximos</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.countdownContainer}>
      <View style={[styles.countdownCard, { backgroundColor: event.color }]}>
        <DecorativeBackground type={event.type} color="#FFFFFF" />
        
        <View style={styles.countdownHeader}>
          <View style={styles.glassTag}>
             <MaterialCommunityIcons name={event.type} size={16} color="white" style={{marginRight: 6}} />
             <Text style={styles.tagText}>Evento Principal</Text>
          </View>
        </View>
        
        <View style={styles.countdownContent}>
          <Text style={styles.countdownTitle} numberOfLines={1}>{event.title}</Text>
          <Text style={styles.countdownDate}>{formatDate(event.date)} • {event.date.getHours()}:{event.date.getMinutes().toString().padStart(2, '0')}h</Text>
        </View>

        <View style={styles.timerWrapper}>
          <View style={styles.timerUnit}>
            <Text style={styles.timerNumber}>{timeLeft.days}</Text>
            <Text style={styles.timerLabel}>DÍAS</Text>
          </View>
          <View style={styles.timerSeparator}><Text style={styles.separatorText}>:</Text></View>
          <View style={styles.timerUnit}>
            <Text style={styles.timerNumber}>{timeLeft.hours}</Text>
            <Text style={styles.timerLabel}>HRS</Text>
          </View>
          <View style={styles.timerSeparator}><Text style={styles.separatorText}>:</Text></View>
          <View style={styles.timerUnit}>
            <Text style={styles.timerNumber}>{timeLeft.minutes}</Text>
            <Text style={styles.timerLabel}>MIN</Text>
          </View>
           {/* Optional: Uncomment if you want to show seconds */}
           {/* <View style={styles.timerSeparator}><Text style={styles.separatorText}>:</Text></View>
           <View style={styles.timerUnit}>
             <Text style={styles.timerNumber}>{timeLeft.seconds}</Text>
             <Text style={styles.timerLabel}>SEG</Text>
           </View> */}
        </View>
      </View>
    </View>
  );
};

const InvitationCard = ({ event }) => {
  const { days } = useCountdown(event.date); // Live update for days too
  
  return (
    <TouchableOpacity style={styles.invitationContainer} activeOpacity={0.9}>
      <View style={styles.envelopeFlap} />
      <View style={[styles.invitationCard, { backgroundColor: '#FFF' }]}>
         <View style={styles.stampContainer}>
            <View style={[styles.stamp, { borderColor: event.color }]}>
              <MaterialCommunityIcons name={event.type} size={20} color={event.color} />
            </View>
         </View>
         <View style={styles.invitationContent}>
            <Text style={styles.invitationTo}>Para: {event.person}</Text>
            <Text style={styles.invitationTitle}>{event.title}</Text>
            <View style={styles.invitationDateRow}>
              <MaterialCommunityIcons name="calendar" size={14} color="#94A3B8" />
              <Text style={styles.invitationDate}>{formatDate(event.date)}</Text>
              <View style={styles.bullet} />
              <Text style={[styles.daysLeft, { color: event.color }]}>Faltan {days} días</Text>
            </View>
         </View>
      </View>
    </TouchableOpacity>
  );
};

// ... (SpoilerGiftList, MemoryCard, BudgetRow, VendorCard remain unchanged) ...
const SpoilerGiftList = ({ ideas, person }) => {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={styles.spoilerContainer}>
      <View style={styles.spoilerHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{person.charAt(0)}</Text>
        </View>
        <Text style={styles.spoilerTitle}>Regalos para {person}</Text>
      </View>
      <TouchableOpacity 
        style={[styles.spoilerContent, !revealed && styles.spoilerHidden]} 
        onPress={() => setRevealed(!revealed)}
        activeOpacity={0.8}
      >
        {revealed ? (
          <View style={styles.revealedList}>
             {ideas.map((idea, idx) => (
               <View key={idx} style={styles.ideaItem}>
                 <MaterialCommunityIcons name="gift-outline" size={16} color="#D946EF" />
                 <Text style={styles.ideaItemText}>{idea}</Text>
               </View>
             ))}
             <Text style={styles.hideHint}>Toca para ocultar</Text>
          </View>
        ) : (
          <View style={styles.hiddenPlaceholder}>
             <MaterialCommunityIcons name="eye-off-outline" size={24} color="#94A3B8" />
             <Text style={styles.hiddenText}>Toca para revelar ideas</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const MemoryCard = ({ memory }) => (
  <View style={styles.memoryCard}>
    <Image source={{ uri: memory.image }} style={styles.memoryImage} />
    <View style={styles.memoryOverlay}>
      <Text style={styles.memoryDate}>{memory.date}</Text>
      <Text style={styles.memoryTitle}>{memory.title}</Text>
    </View>
  </View>
);

const BudgetRow = ({ category }) => {
  const percentage = Math.min(100, (category.spent / category.estimated) * 100);
  return (
    <View style={styles.budgetRow}>
      <View style={styles.budgetHeader}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryAmount}>{category.spent}€ / {category.estimated}€</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: category.color }]} />
      </View>
    </View>
  );
};

const VendorCard = ({ vendor }) => (
  <View style={styles.vendorCard}>
    <View style={styles.vendorInfo}>
      <View style={styles.vendorIcon}>
        <Text style={styles.vendorInitial}>{vendor.name.charAt(0)}</Text>
      </View>
      <View>
        <Text style={styles.vendorName}>
          {vendor.name} {vendor.verified && <MaterialCommunityIcons name="check-decagram" size={14} color="#3B82F6" />}
        </Text>
        <Text style={styles.vendorRole}>{vendor.role}</Text>
      </View>
    </View>
    <View style={styles.vendorActions}>
       <View style={styles.ratingBadge}>
         <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
         <Text style={styles.ratingText}>{vendor.rating}</Text>
       </View>
       <TouchableOpacity style={styles.callBtn}>
         <MaterialCommunityIcons name="phone" size={16} color="#FFF" />
       </TouchableOpacity>
    </View>
  </View>
);

export default function EventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  
  const sortedEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(e => e.date >= now)
      .sort((a, b) => a.date - b.date);
  }, [events]);

  const nextEvent = sortedEvents[0];
  const otherEvents = sortedEvents.slice(1);

  const handleAddEvent = (newEvent) => {
    const eventWithId = { ...newEvent, id: Date.now().toString() };
    setEvents([...events, eventWithId]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Social</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>EL GRAN EVENTO</Text>
        <DynamicCountdown event={nextEvent} />

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>INVITACIONES PENDIENTES</Text>
        <View style={styles.invitationsGrid}>
          {otherEvents.map(event => (
            <InvitationCard key={event.id} event={event} />
          ))}
           {otherEvents.length === 0 && (
            <Text style={styles.emptyText}>No hay más invitaciones próximas.</Text>
          )}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>TOP SECRET: REGALOS 🤫</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.giftsScroll} contentContainerStyle={{ paddingRight: 20 }}>
           {GIFT_IDEAS.map(item => (
             <SpoilerGiftList key={item.id} ideas={item.ideas} person={item.person} />
           ))}
        </ScrollView>

        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>GALERÍA DE RECUERDOS 📸</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoriesScroll} contentContainerStyle={{ paddingRight: 20 }}>
          {PAST_MEMORIES.map(memory => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </ScrollView>

        {/* Static sections for now */}
        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>PRESUPUESTO EVENTO (Boda)</Text>
        <View style={styles.budgetCard}>
          <View style={styles.budgetTotalRow}>
             <Text style={styles.budgetTotalLabel}>Total Presupuesto</Text>
             <Text style={styles.budgetTotalAmount}>{EVENT_BUDGET.total}€</Text>
          </View>
          <Text style={styles.budgetSpentText}>Gastado: {EVENT_BUDGET.spent}€</Text>
          <View style={styles.divider} />
          {EVENT_BUDGET.categories.map(cat => (
            <BudgetRow key={cat.id} category={cat} />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 30 }]}>PROVEEDORES FAVORITOS</Text>
        <View style={styles.vendorList}>
          {VENDORS.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
      
      <AddEventModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onAdd={handleAddEvent} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  addBtn: {
    backgroundColor: '#D946EF',
    padding: 8,
    borderRadius: 12,
    marginRight: -4,
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  saveBtn: {
    backgroundColor: '#D946EF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Countdown
  countdownContainer: {
    shadowColor: '#D946EF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  countdownCard: {
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
  },
  countdownContent: {
    marginTop: 10,
  },
  countdownTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countdownDate: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timerUnit: {
    alignItems: 'center',
    minWidth: 50,
  },
  timerNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    marginTop: 2,
  },
  timerSeparator: {
    paddingHorizontal: 8,
    height: 40,
    justifyContent: 'center',
  },
  separatorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 24,
    fontWeight: '300',
    marginTop: -10,
  },
  decoCircle: {
    position: 'absolute',
    borderRadius: 999,
  },

  // Invitations
  invitationsGrid: {
    gap: 16,
  },
  invitationContainer: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  invitationCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopWidth: 4,
    borderTopColor: '#F1F5F9', 
  },
  envelopeFlap: {
    position: 'absolute',
    top: -4,
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    opacity: 0.5,
  },
  stampContainer: {
    marginRight: 16,
  },
  stamp: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    transform: [{ rotate: '-5deg' }],
  },
  invitationContent: {
    flex: 1,
  },
  invitationTo: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  invitationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  invitationDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invitationDate: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  daysLeft: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },

  // Spoiler Gifts
  giftsScroll: {
    marginHorizontal: -20, 
    paddingHorizontal: 20,
  },
  spoilerContainer: {
    width: 240,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  spoilerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FAE8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitials: {
    fontSize: 12,
    color: '#D946EF',
    fontWeight: '700',
  },
  spoilerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  spoilerContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  spoilerHidden: {
    alignItems: 'center',
    backgroundColor: '#1E293B', 
  },
  hiddenText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  hiddenPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  revealedList: {
    padding: 12,
  },
  ideaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  ideaItemText: {
    fontSize: 13,
    color: '#475569',
  },
  hideHint: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
  },

  // Memories
  memoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  memoryCard: {
    width: 140,
    height: 180,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  memoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  memoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  memoryDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  memoryTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },

  // Budget
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  budgetTotalLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  budgetTotalAmount: {
    fontSize: 24,
    color: '#0F172A',
    fontWeight: '800',
  },
  budgetSpentText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  budgetRow: {
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 12,
    color: '#64748B',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Vendors
  vendorList: {
    gap: 12,
  },
  vendorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  vendorRole: {
    fontSize: 12,
    color: '#64748B',
  },
  vendorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
