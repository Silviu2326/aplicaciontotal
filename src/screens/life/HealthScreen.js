import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#F43F5E'; // Rose/Pink
const CHART_WIDTH = width - 40;

// --- HELPER FUNCTIONS ---

const getStatusColor = (status) => {
  switch (status) {
    case 'good': return '#10B981'; // Green
    case 'warning': return '#F59E0B'; // Amber
    case 'alert': return '#EF4444'; // Red
    default: return '#64748B'; // Slate
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'good': return 'Normal';
    case 'warning': return 'Atención';
    case 'alert': return 'Alto';
    default: return '--';
  }
};

// --- MOCK DATA (INITIAL STATE) ---

const INITIAL_VITALS = [
  { id: 'v1', label: 'Peso', value: '72.5', unit: 'kg', status: 'good', icon: 'scale-bathroom', trend: '-0.5kg' },
  { id: 'v2', label: 'Presión', value: '128/85', unit: 'mmHg', status: 'warning', icon: 'heart-pulse', trend: '+2%' },
  { id: 'v3', label: 'Pulso', value: '64', unit: 'bpm', status: 'good', icon: 'pulse', trend: 'Repos' },
];

const INITIAL_SLEEP_DATA = {
  labels: ["L", "M", "X", "J", "V", "S", "D"],
  datasets: [
    {
      data: [7.5, 6.2, 8.0, 5.5, 7.0, 9.0, 8.5],
      color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
      strokeWidth: 3
    }
  ],
  legend: ["Horas de Sueño"]
};

const INITIAL_MEDICATIONS = [
  { id: 'm1', name: 'Vitamina D', time: '08:00', dose: '1 tab', taken: true },
  { id: 'm2', name: 'Omega 3', time: '14:00', dose: '1 cap', taken: false },
  { id: 'm3', name: 'Magnesio', time: '21:00', dose: '2 tabs', taken: false },
];

const APPOINTMENTS = [
  { id: 'a1', title: 'Chequeo Anual', doctor: 'Dr. Martínez', specialty: 'Cardiología', date: '24 Nov', time: '10:30 AM' },
  { id: 'a2', title: 'Limpieza Dental', doctor: 'Dra. Solís', specialty: 'Odontología', date: '02 Dic', time: '04:00 PM' },
];

const LAB_RESULTS = [
  { id: 'l1', name: 'Colesterol', value: '185', unit: 'mg/dL', status: 'good', date: '15 Oct' },
  { id: 'l2', name: 'Glucosa', value: '92', unit: 'mg/dL', status: 'good', date: '15 Oct' },
  { id: 'l3', name: 'Hierro', value: '60', unit: 'µg/dL', status: 'warning', date: '15 Oct' },
];

const VACCINES = [
  { id: 'v1', name: 'Gripe Estacional', date: '10 Nov 2024', nextDate: 'Oct 2025', status: 'active' },
  { id: 'v2', name: 'Tétanos', date: '15 May 2020', nextDate: 'May 2030', status: 'active' },
  { id: 'v3', name: 'Hepatitis B', date: '20 Ene 2015', nextDate: '--', status: 'completed' },
];

// --- COMPONENTES ---

const VitalsCard = ({ item }) => {
  const statusColor = getStatusColor(item.status);
  
  return (
    <View style={styles.vitalCard}>
      <View style={styles.vitalHeader}>
        <View style={[styles.iconContainer, { backgroundColor: statusColor + '20' }]}>
          <MaterialCommunityIcons name={item.icon} size={20} color={statusColor} />
        </View>
        <Text style={[styles.vitalTrend, { color: statusColor }]}>
          {item.trend}
        </Text>
      </View>
      
      <View style={styles.vitalContent}>
        <Text style={styles.vitalLabel}>{item.label}</Text>
        <View style={styles.valueRow}>
          <Text style={styles.vitalValue}>{item.value}</Text>
          <Text style={styles.vitalUnit}>{item.unit}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
           <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
    </View>
  );
};

const TrendChart = ({ data }) => {
  const average = (data.datasets[0].data.reduce((a, b) => a + b, 0) / data.datasets[0].data.length).toFixed(1);

  return (
    <View style={styles.chartCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>Tendencia de Sueño</Text>
          <Text style={styles.cardSubtitle}>Promedio Semanal: {average}h</Text>
        </View>
        <View style={styles.chartIcon}>
           <MaterialCommunityIcons name="sleep" size={20} color="#FFF" />
        </View>
      </View>
      
      <LineChart
        data={data}
        width={CHART_WIDTH - 32}
        height={180}
        yAxisSuffix="h"
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(244, 63, 94, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#fff"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        withInnerLines={false}
        withOuterLines={false}
      />
    </View>
  );
};

const MedicationTimeline = ({ medications, onToggle }) => (
  <View style={styles.medSection}>
    <Text style={styles.sectionTitle}>Recordatorio de Medicación</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medList}>
      {medications.map((med, index) => (
        <View key={med.id} style={styles.medItemContainer}>
           {/* Timeline Line */}
           <View style={styles.timelineLineContainer}>
              <View style={[styles.timelineDot, med.taken ? styles.timelineDotTaken : styles.timelineDotPending]} />
              {index < medications.length - 1 && <View style={styles.timelineConnector} />}
           </View>
           
           {/* Card */}
           <View style={[styles.medCard, med.taken ? styles.medCardTaken : null]}>
              <Text style={styles.medTime}>{med.time}</Text>
              <Text style={[styles.medName, med.taken ? styles.medTextTaken : null]}>{med.name}</Text>
              <Text style={styles.medDose}>{med.dose}</Text>
              <TouchableOpacity 
                style={styles.checkButton}
                onPress={() => onToggle(med.id)}
              >
                 <MaterialCommunityIcons 
                    name={med.taken ? "check-circle" : "circle-outline"} 
                    size={24} 
                    color={med.taken ? "#10B981" : "#CBD5E1"} 
                 />
              </TouchableOpacity>
           </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

const AppointmentCard = ({ item }) => (
  <TouchableOpacity style={styles.aptCard} activeOpacity={0.8} onPress={() => Alert.alert('Detalles', `Cita con ${item.doctor}`)}>
    <View style={styles.aptLeftStrip} />
    <View style={styles.aptContent}>
      <View style={styles.aptHeader}>
        <Text style={styles.aptTitle}>{item.title}</Text>
        <View style={styles.aptDateBadge}>
          <Text style={styles.aptDateText}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.aptDoctor}>{item.doctor}</Text>
      <Text style={styles.aptSpecialty}>{item.specialty}</Text>
      <View style={styles.aptFooter}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#64748B" />
        <Text style={styles.aptTime}>{item.time}</Text>
      </View>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" style={{ alignSelf: 'center' }} />
  </TouchableOpacity>
);

const LabResultCard = ({ item }) => {
  const color = getStatusColor(item.status);
  return (
    <View style={styles.labCard}>
      <View style={styles.labHeader}>
        <Text style={styles.labName}>{item.name}</Text>
        <Text style={styles.labDate}>{item.date}</Text>
      </View>
      <View style={styles.labValueRow}>
        <Text style={[styles.labValue, { color }]}>{item.value}</Text>
        <Text style={styles.labUnit}>{item.unit}</Text>
      </View>
      <View style={[styles.labStatusBadge, { backgroundColor: color + '20' }]}>
        <Text style={[styles.labStatusText, { color }]}>{getStatusLabel(item.status)}</Text>
      </View>
    </View>
  );
};

const VaccineCard = ({ item }) => (
  <View style={styles.vaxCard}>
    <View style={styles.vaxIcon}>
      <MaterialCommunityIcons name="shield-check" size={24} color="#FFF" />
    </View>
    <View style={styles.vaxContent}>
      <Text style={styles.vaxName}>{item.name}</Text>
      <View style={styles.vaxRow}>
        <MaterialCommunityIcons name="calendar-check" size={14} color="#64748B" />
        <Text style={styles.vaxDate}>Puesta: {item.date}</Text>
      </View>
      {item.nextDate !== '--' && (
        <View style={styles.vaxRow}>
          <MaterialCommunityIcons name="calendar-refresh" size={14} color="#F59E0B" />
          <Text style={styles.vaxNextDate}>Próxima: {item.nextDate}</Text>
        </View>
      )}
    </View>
    <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#10B981' : '#64748B' }]} />
  </View>
);

const MentalCheckSection = () => {
  const [mood, setMood] = useState(7);
  const [stress, setStress] = useState(4);

  const handleSave = () => {
    Alert.alert("Registrado", "Tu chequeo mental ha sido guardado correctamente.");
  };

  const renderSlider = (label, value, setValue, color, icon) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
           <MaterialCommunityIcons name={icon} size={20} color={color} />
           <Text style={styles.sliderLabel}>{label}</Text>
        </View>
        <Text style={[styles.sliderValue, { color }]}>{value}/10</Text>
      </View>
      <View style={styles.sliderTrack}>
         {[...Array(10)].map((_, i) => (
           <TouchableOpacity 
              key={i} 
              activeOpacity={0.8}
              style={[
                styles.sliderSegment, 
                { 
                  backgroundColor: i < value ? color : '#F1F5F9',
                  borderRightWidth: i < 9 ? 2 : 0,
                  borderColor: '#fff'
                }
              ]}
              onPress={() => setValue(i + 1)}
           />
         ))}
      </View>
    </View>
  );

  return (
    <View style={styles.mentalCard}>
       <View style={styles.cardHeader}>
         <View>
            <Text style={styles.cardTitle}>Chequeo Mental</Text>
            <Text style={styles.cardSubtitle}>Registro diario de bienestar</Text>
         </View>
         <View style={[styles.chartIcon, { backgroundColor: '#8B5CF6' }]}>
            <MaterialCommunityIcons name="brain" size={20} color="#FFF" />
         </View>
       </View>
       
       <View style={{ height: 16 }} />
       {renderSlider("Estado de Ánimo", mood, setMood, "#10B981", "emoticon-happy-outline")}
       <View style={{ height: 20 }} />
       {renderSlider("Nivel de Estrés", stress, setStress, "#F43F5E", "lightning-bolt")}

       <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Registro</Text>
       </TouchableOpacity>
    </View>
  );
};

// --- SCREEN PRINCIPAL ---

export default function HealthScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [vitals, setVitals] = useState(INITIAL_VITALS);
  const [sleepData, setSleepData] = useState(INITIAL_SLEEP_DATA);
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [recordType, setRecordType] = useState('weight'); // 'weight' | 'pressure' | 'pulse' | 'sleep'
  const [inputValue, setInputValue] = useState('');

  const toggleMedication = (id) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const handleAddRecord = () => {
    if (!inputValue.trim()) {
      Alert.alert("Error", "Por favor ingresa un valor");
      return;
    }

    if (recordType === 'sleep') {
      const val = parseFloat(inputValue);
      if (isNaN(val)) {
        Alert.alert("Error", "Ingresa un número válido");
        return;
      }

      const newData = [...sleepData.datasets[0].data];
      newData.shift(); // Remove oldest
      newData.push(val);
      
      // Rotate days labels for effect
      const newLabels = [...sleepData.labels];
      const first = newLabels.shift();
      newLabels.push(first);

      setSleepData({
        ...sleepData,
        labels: newLabels,
        datasets: [{ ...sleepData.datasets[0], data: newData }]
      });

      Alert.alert("Éxito", "Registro de sueño actualizado");
    } else {
      // Vital Update
      setVitals(prev => prev.map(v => {
        if ((recordType === 'weight' && v.id === 'v1') ||
            (recordType === 'pressure' && v.id === 'v2') ||
            (recordType === 'pulse' && v.id === 'v3')) {
          return { 
            ...v, 
            value: inputValue, 
            trend: 'Actualizado' 
          };
        }
        return v;
      }));
      Alert.alert("Éxito", "Constante vital actualizada");
    }

    setModalVisible(false);
    setInputValue('');
  };

  const renderTypeSelector = (type, label, icon) => (
    <TouchableOpacity 
      style={[styles.typeOption, recordType === type && styles.typeOptionSelected]}
      onPress={() => setRecordType(type)}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={recordType === type ? '#fff' : '#64748B'} 
      />
      <Text style={[styles.typeText, recordType === type && styles.typeTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Background with Gradient */}
      <LinearGradient
        colors={[THEME_COLOR, '#E11D48']}
        style={[styles.bgHeader, { height: insets.top + 80 }]}
      />

      {/* --- HEADER --- */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salud & Bienestar</Text>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. VITAL SIGNS WIDGETS */}
        <View style={styles.vitalsRow}>
          {vitals.map(item => <VitalsCard key={item.id} item={item} />)}
        </View>

        {/* 2. BEZIER CHART */}
        <TrendChart data={sleepData} />

        {/* 3. MEDICATION TIMELINE */}
        <MedicationTimeline medications={medications} onToggle={toggleMedication} />

        {/* 4. APPOINTMENTS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Próximas Citas</Text>
            <TouchableOpacity onPress={() => Alert.alert("Info", "Mostrando todas las citas")}>
              <Text style={styles.seeAllLink}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.aptList}>
            {APPOINTMENTS.map(item => <AppointmentCard key={item.id} item={item} />)}
          </View>
        </View>

        {/* 5. LAB RESULTS */}
        <View style={styles.sectionContainer}>
           <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Resultados de Análisis</Text>
              <TouchableOpacity onPress={() => Alert.alert("Info", "Historial completo")}>
                <Text style={styles.seeAllLink}>Historial</Text>
              </TouchableOpacity>
           </View>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
              {LAB_RESULTS.map(item => <LabResultCard key={item.id} item={item} />)}
           </ScrollView>
        </View>

        {/* 6. VACCINATIONS */}
        <View style={styles.sectionContainer}>
           <Text style={styles.sectionTitle}>Carnet de Vacunación</Text>
           <View style={{ gap: 12 }}>
              {VACCINES.map(item => <VaccineCard key={item.id} item={item} />)}
           </View>
        </View>

        {/* 7. MENTAL CHECK */}
        <MentalCheckSection />
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- ADD RECORD MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Registro</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>¿Qué quieres registrar?</Text>
            <View style={styles.typeSelector}>
              {renderTypeSelector('weight', 'Peso', 'scale-bathroom')}
              {renderTypeSelector('pressure', 'Presión', 'heart-pulse')}
            </View>
            <View style={[styles.typeSelector, { marginTop: 8 }]}>
              {renderTypeSelector('pulse', 'Pulso', 'pulse')}
              {renderTypeSelector('sleep', 'Sueño', 'sleep')}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>
              {recordType === 'sleep' ? 'Horas dormidas:' : 'Valor del registro:'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={
                recordType === 'weight' ? "Ej: 73.5" : 
                recordType === 'pressure' ? "Ej: 120/80" : 
                recordType === 'pulse' ? "Ej: 70" : "Ej: 7.5"
              }
              keyboardType={recordType === 'pressure' ? 'default' : 'numeric'}
              value={inputValue}
              onChangeText={setInputValue}
            />

            <TouchableOpacity style={styles.saveModalButton} onPress={handleAddRecord}>
              <Text style={styles.saveModalButtonText}>Guardar Registro</Text>
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
  bgHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  navButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    backdropFilter: 'blur(10px)', // Works on iOS
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  
  // Vitals
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 130,
  },
  vitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 6,
    borderRadius: 10,
  },
  vitalTrend: {
    fontSize: 11,
    fontWeight: '600',
  },
  vitalContent: {
    marginTop: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 6,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  vitalUnit: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Chart Card
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  chartIcon: {
    backgroundColor: THEME_COLOR,
    padding: 8,
    borderRadius: 12,
  },

  // Medication Timeline
  medSection: {
    marginBottom: 24,
  },
  medList: {
    paddingVertical: 10,
    gap: 16,
  },
  medItemContainer: {
    width: 140,
  },
  timelineLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  timelineDotTaken: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  timelineDotPending: {
    backgroundColor: 'transparent',
    borderColor: '#CBD5E1',
  },
  timelineConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
  },
  medCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  medCardTaken: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  medTime: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME_COLOR,
    marginBottom: 4,
  },
  medName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  medTextTaken: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  medDose: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  checkButton: {
    alignSelf: 'flex-end',
  },

  // Appointments
  sectionContainer: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR,
  },
  aptList: {
    gap: 12,
  },
  aptCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  aptLeftStrip: {
    width: 4,
    backgroundColor: THEME_COLOR,
    borderRadius: 2,
    marginRight: 12,
  },
  aptContent: {
    flex: 1,
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  aptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  aptDateBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aptDateText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME_COLOR,
  },
  aptDoctor: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  aptSpecialty: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  aptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aptTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Lab Results
  labCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: 140,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  labHeader: {
    marginBottom: 8,
  },
  labName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  labDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  labValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 8,
  },
  labValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  labUnit: {
    fontSize: 10,
    color: '#64748B',
  },
  labStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  labStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Vaccines
  vaxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vaxIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaxContent: {
    flex: 1,
  },
  vaxName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  vaxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vaxDate: {
    fontSize: 12,
    color: '#64748B',
  },
  vaxNextDate: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Mental Check
  mentalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sliderContainer: {
    marginBottom: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sliderTrack: {
    flexDirection: 'row',
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  sliderSegment: {
    flex: 1,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTextSelected: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  saveModalButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
