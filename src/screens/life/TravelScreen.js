import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions,
  Alert,
  Pressable,
  TextInput,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#06B6D4'; // Cyan

// --- MOCK DATA ---
const NEXT_TRIP = {
  id: 'trip1',
  destination: 'Kyoto, Japón',
  dates: '10 Abr - 24 Abr',
  daysLeft: 142,
  image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', // Kyoto Image
  flight: 'JL 408',
  weather: { temp: 18, condition: 'Parcialmente Nublado', icon: 'weather-partly-cloudy' }
};

const INITIAL_ITINERARY = [
  { id: '1', time: '08:00', title: 'Vuelo JL408 -> Tokyo (HND)', icon: 'airplane-takeoff', type: 'transport', details: 'Terminal 4S, Asiento 12A' },
  { id: '2', time: '16:30', title: 'Narita Express -> Kyoto', icon: 'train-variant', type: 'transport', details: 'Vagón 4, Asiento 2B' },
  { id: '3', time: '19:00', title: 'Check-in Ryokan Yachiyo', icon: 'bed', type: 'stay', details: 'Reserva #88291' },
  { id: '4', time: '20:30', title: 'Cena en Gion District', icon: 'food-variant', type: 'food', details: 'Reservado 2 pax' },
];

const INITIAL_PACKING_LIST = [
  { id: 'p1', label: 'Pasaporte y Visado', checked: true, icon: 'passport' },
  { id: 'p2', label: 'Billetes de Avión Impresos', checked: true, icon: 'ticket-confirmation' },
  { id: 'p3', label: 'Adaptador de Corriente (Tipo A)', checked: false, icon: 'power-plug' },
  { id: 'p4', label: 'Yenes (Efectivo)', checked: false, icon: 'cash-multiple' },
  { id: 'p5', label: 'Seguro de Viaje', checked: true, icon: 'file-document' },
  { id: 'p6', label: 'Cámara y Baterías', checked: false, icon: 'camera' },
  { id: 'p7', label: 'Ropa para 14 días', checked: false, icon: 'tshirt-crew' },
];

const LOCAL_GUIDE = [
  { id: 'g1', title: 'Fushimi Inari', rating: '4.9', image: 'https://images.unsplash.com/photo-1478436127897-769e1a3f0c21?w=800&q=80', type: 'Santuario' },
  { id: 'g2', title: 'Kinkaku-ji', rating: '4.8', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80', type: 'Templo' },
  { id: 'g3', title: 'Arashiyama', rating: '4.7', image: 'https://images.unsplash.com/photo-1528360983277-13d9b152c6d4?w=800&q=80', type: 'Naturaleza' },
];

const ESSENTIAL_PHRASES = [
  { id: 'ph1', native: 'Hola', target: 'Konnichiwa', pronunciation: 'Kon-ni-chi-wa' },
  { id: 'ph2', native: 'Gracias', target: 'Arigatou', pronunciation: 'A-ri-ga-to' },
  { id: 'ph3', native: 'Disculpe', target: 'Sumimasen', pronunciation: 'Su-mi-ma-sen' },
  { id: 'ph4', native: 'Agua, por favor', target: 'Mizu o kudasai', pronunciation: 'Mi-zu o ku-da-sai' },
];

const TRAVEL_DOCS = [
  { id: 'd1', title: 'Pasaporte', type: 'passport', expiry: 'Exp: 12/2028', icon: 'passport' },
  { id: 'd2', title: 'Boarding Pass', type: 'boarding', sub: 'JL 408', icon: 'qrcode' },
  { id: 'd3', title: 'Seguro', type: 'insurance', sub: 'Poliza #9921', icon: 'shield-check' },
];

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('100');
  const rate = 156.42; // EUR to JPY example

  return (
    <View style={styles.converterCard}>
      <View style={styles.converterHeader}>
        <MaterialCommunityIcons name="currency-eur" size={20} color="#fff" />
        <MaterialCommunityIcons name="arrow-right" size={16} color="#rgba(255,255,255,0.6)" />
        <MaterialCommunityIcons name="currency-jpy" size={20} color="#fff" />
      </View>
      
      <View style={styles.converterBody}>
        <View style={styles.inputContainer}>
          <TextInput 
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.currencyInput}
            selectionColor="#fff"
          />
          <Text style={styles.currencyLabel}>EUR</Text>
        </View>
        <View style={styles.dividerVertical} />
        <View style={styles.resultContainer}>
          <Text style={styles.currencyResult}>
            {amount ? (parseFloat(amount) * rate).toLocaleString('ja-JP', { maximumFractionDigits: 0 }) : '0'}
          </Text>
          <Text style={styles.currencyLabel}>JPY</Text>
        </View>
      </View>
      <Text style={styles.rateText}>1 EUR = {rate} JPY • Actualizado hace 5 min</Text>
    </View>
  );
};

export default function TravelScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [packingList, setPackingList] = useState(INITIAL_PACKING_LIST);
  const [itinerary, setItinerary] = useState(INITIAL_ITINERARY);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    time: '',
    title: '',
    details: '',
    icon: 'star', // default
    type: 'other'
  });

  const togglePackingItem = (id) => {
    setPackingList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const calculateProgress = () => {
    const total = packingList.length;
    const checked = packingList.filter(i => i.checked).length;
    return Math.round((checked / total) * 100);
  };

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      Alert.alert('Error', 'Por favor completa la hora y el título');
      return;
    }
    
    const eventToAdd = {
      id: Date.now().toString(),
      ...newEvent
    };
    
    setItinerary([...itinerary, eventToAdd].sort((a, b) => a.time.localeCompare(b.time)));
    setModalVisible(false);
    setNewEvent({ time: '', title: '', details: '', icon: 'star', type: 'other' });
  };

  const renderItineraryItem = (item, index) => {
    const isLast = index === itinerary.length - 1;
    return (
      <View key={item.id} style={styles.itineraryRow}>
        <View style={styles.timelineContainer}>
          <View style={[styles.timelineDot, { backgroundColor: THEME_COLOR }]} />
          {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.itineraryContent}>
          <View style={styles.timeTag}>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <View style={styles.itineraryCard}>
            <View style={[styles.itineraryIcon, { backgroundColor: THEME_COLOR + '15' }]}>
              <MaterialCommunityIcons name={item.icon} size={20} color={THEME_COLOR} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.itineraryTitle}>{item.title}</Text>
              <Text style={styles.itineraryDetails}>{item.details}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[0]} // Optional: if we wanted a sticky header, but using parallax style here
      >
        {/* --- IMMERSIVE HEADER --- */}
        <View style={styles.headerWrapper}>
          <ImageBackground
            source={{ uri: NEXT_TRIP.image }}
            style={[styles.headerImage, { height: 400 }]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
              style={styles.headerGradient}
            >
              {/* Top Bar */}
              <View style={[styles.topBar, { marginTop: insets.top }]}>
                <TouchableOpacity 
                  style={styles.glassButton} 
                  onPress={() => navigation.goBack()}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.glassButton} 
                  onPress={() => Alert.alert('Opciones', 'Configuración de viajes')}
                >
                  <MaterialCommunityIcons name="dots-horizontal" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Header Content */}
              <View style={styles.headerContent}>
                <View style={styles.weatherBadge}>
                  <MaterialCommunityIcons name={NEXT_TRIP.weather.icon} size={16} color="#fff" />
                  <Text style={styles.weatherText}>{NEXT_TRIP.weather.temp}° {NEXT_TRIP.weather.condition}</Text>
                </View>
                <Text style={styles.destinationTitle}>{NEXT_TRIP.destination}</Text>
                <View style={styles.dateRow}>
                  <MaterialCommunityIcons name="calendar-range" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.dateText}>{NEXT_TRIP.dates}</Text>
                  <View style={styles.daysLeftBadge}>
                    <Text style={styles.daysLeftText}>Faltan {NEXT_TRIP.daysLeft} días</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* --- MAIN CONTENT --- */}
        <View style={styles.contentBody}>
          
          {/* --- TRAVEL DOCUMENTS --- */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { marginBottom: 16, paddingHorizontal: 4 }]}>Documentos de Viaje</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {TRAVEL_DOCS.map((doc) => (
                <TouchableOpacity key={doc.id} style={styles.docCard}>
                  <View style={styles.docHeader}>
                    <View style={[styles.docIcon, { backgroundColor: doc.type === 'passport' ? '#E0F2FE' : '#F1F5F9' }]}>
                      <MaterialCommunityIcons name={doc.icon} size={22} color={doc.type === 'passport' ? '#0284C7' : '#64748B'} />
                    </View>
                    {doc.type === 'passport' && <MaterialCommunityIcons name="check-decagram" size={16} color="#0284C7" />}
                  </View>
                  <View>
                    <Text style={styles.docTitle}>{doc.title}</Text>
                    <Text style={styles.docSub}>{doc.sub || doc.expiry}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Widgets Row */ }
          <View style={styles.widgetsRow}>
            <View style={{ flex: 1 }}>
              <CurrencyConverter />
            </View>
          </View>

          {/* --- ITINERARY --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Itinerario de Viaje</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialCommunityIcons name="plus-circle" size={16} color={THEME_COLOR} style={{marginRight: 4}} />
                  <Text style={styles.seeAll}>Añadir</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.itineraryList}>
              {itinerary.map((item, index) => renderItineraryItem(item, index))}
            </View>
          </View>

          {/* --- LOCAL GUIDE --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guía Local</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Explorar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {LOCAL_GUIDE.map((place) => (
                <TouchableOpacity key={place.id} style={styles.guideCard}>
                  <ImageBackground 
                    source={{ uri: place.image }} 
                    style={styles.guideImage} 
                    imageStyle={{ borderRadius: 20 }}
                  >
                    <View style={styles.guideBadge}>
                      <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.guideRating}>{place.rating}</Text>
                    </View>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.guideOverlay}
                    >
                      <Text style={styles.guideTitle}>{place.title}</Text>
                      <Text style={styles.guideType}>{place.type}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* --- ESSENTIAL PHRASES --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Frases Esenciales</Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="translate" size={20} color={THEME_COLOR} />
              </TouchableOpacity>
            </View>
            <View style={styles.phrasesGrid}>
              {ESSENTIAL_PHRASES.map((phrase) => (
                <TouchableOpacity key={phrase.id} style={styles.phraseCard}>
                  <View style={styles.phraseHeader}>
                    <Text style={styles.phraseNative}>{phrase.native}</Text>
                    <MaterialCommunityIcons name="volume-high" size={16} color="#CBD5E1" />
                  </View>
                  <Text style={styles.phraseTarget}>{phrase.target}</Text>
                  <Text style={styles.phrasePronunciation}>{phrase.pronunciation}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* --- PACKING CHECKLIST --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Maleta</Text>
              <Text style={styles.progressText}>{calculateProgress()}% Listo</Text>
            </View>
            
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${calculateProgress()}%` }]} />
            </View>

            <View style={styles.packingListContainer}>
              {packingList.map((item) => (
                <Pressable 
                  key={item.id} 
                  style={styles.packingItem}
                  onPress={() => togglePackingItem(item.id)}
                >
                  <View style={[styles.checkCircle, item.checked && styles.checkCircleActive]}>
                    {item.checked && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                  </View>
                  <Text style={[styles.packingLabel, item.checked && styles.packingLabelDone]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- ADD EVENT MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Evento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hora</Text>
              <TextInput
                style={styles.input}
                placeholder="00:00"
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({...newEvent, time: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Vuelo, Cena, Visita..."
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Detalles</Text>
              <TextInput
                style={styles.input}
                placeholder="Ubicación, notas..."
                value={newEvent.details}
                onChangeText={(text) => setNewEvent({...newEvent, details: text})}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>Añadir al Itinerario</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerWrapper: {
    height: 400,
    marginBottom: -40, 
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 60, 
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  glassButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  weatherText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  destinationTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 48,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  dateText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 16,
  },
  daysLeftBadge: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysLeftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  
  contentBody: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#F8FAFC',
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  
  // Widgets
  widgetsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  converterCard: {
    backgroundColor: '#1E293B', // Dark card for contrast
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  converterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    opacity: 0.8,
  },
  converterBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
  },
  currencyInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    padding: 0,
  },
  currencyLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  currencyResult: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLOR,
  },
  rateText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
  },

  // Section Shared
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },

  // Itinerary
  itineraryList: {
    paddingLeft: 8,
  },
  itineraryRow: {
    flexDirection: 'row',
  },
  timelineContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: THEME_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 1, // Thinner for dashed
    borderLeftWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed', // Dotted line
    marginVertical: 4,
  },
  itineraryContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timeTag: {
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  itineraryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itineraryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itineraryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  itineraryDetails: {
    fontSize: 13,
    color: '#64748B',
  },

  // Packing List
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME_COLOR,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: '700',
  },
  packingListContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  packingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 8, // Squircle
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  packingLabel: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  packingLabelDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },

  // --- NEW SECTIONS STYLES ---
  
  // Documents
  docCard: {
    width: 150,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  docSub: {
    fontSize: 12,
    color: '#64748B',
  },

  // Local Guide
  guideCard: {
    width: 220,
    height: 280,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  guideImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  guideBadge: {
    alignSelf: 'flex-end',
    margin: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  guideRating: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    color: '#1E293B',
  },
  guideOverlay: {
    padding: 16,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  guideTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  guideType: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },

  // Phrases
  phrasesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  phraseCard: {
    width: '48%', // Grid column
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  phraseNative: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phraseTarget: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  phrasePronunciation: {
    fontSize: 13,
    color: THEME_COLOR,
    fontWeight: '500',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
