import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const THEME_COLOR = '#F59E0B'; // Amber/Orange for University

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const SUBJECT_COLORS = {
  'Física II': '#8B5CF6', // Violet
  'Programación Avanzada': '#10B981', // Emerald
  'Estadística': '#EF4444', // Red
  'Cálculo Multivariable': '#F59E0B', // Amber
  'Bases de Datos': '#3B82F6', // Blue
  'Inglés Técnico': '#EC4899', // Pink
};

const UniversityScreen = () => {
  const navigation = useNavigation();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Mock Data: Next Exam/Delivery
  const [nextEvent, setNextEvent] = useState({
    id: '1',
    subject: 'Cálculo Multivariable',
    type: 'Examen Parcial',
    date: '24 Nov',
    daysLeft: 5,
    location: 'Aula Magna',
  });

  // Mock Data: Today's Schedule
  const [schedule, setSchedule] = useState([
    { id: '1', time: '08:00 - 10:00', subject: 'Física II', room: 'B-204', type: 'Teoría' },
    { id: '2', time: '10:30 - 12:30', subject: 'Programación Avanzada', room: 'Lab 3', type: 'Laboratorio' },
    { id: '3', time: '14:00 - 16:00', subject: 'Estadística', room: 'C-101', type: 'Teoría' },
  ]);

  // Mock Data: Grades
  const [grades, setGrades] = useState([
    { id: '1', subject: 'Bases de Datos', grade: 9.2, credits: 6 },
    { id: '2', subject: 'Física II', grade: 7.5, credits: 6 },
    { id: '3', subject: 'Programación Avanzada', grade: 8.8, credits: 8 },
    { id: '4', subject: 'Inglés Técnico', grade: 9.5, credits: 4 },
  ]);

  // Mock Data: Personal Library
  const [libraryData, setLibraryData] = useState([
    { id: '1', title: 'Física Universitaria', type: 'Libro', status: 'Referencia' },
    { id: '2', title: 'Clean Code', type: 'PDF', status: 'Lectura' },
    { id: '3', title: 'Apuntes Cálculo', type: 'PDF', status: 'Repaso' },
    { id: '4', title: 'Estadística Básica', type: 'Libro', status: 'Referencia' },
  ]);

  // Mock Data: Professors
  const [professorsData, setProfessorsData] = useState([
    { id: '1', name: 'Dr. Elena Torres', subject: 'Física II', email: 'etorres@uni.edu', hours: 'Lun 10-12h' },
    { id: '2', name: 'Ing. Carlos Ruiz', subject: 'Prog. Avanzada', email: 'cruiz@uni.edu', hours: 'Mie 16-18h' },
    { id: '3', name: 'Dr. Alan Smith', subject: 'Inglés Técnico', email: 'asmith@uni.edu', hours: 'Vie 09-11h' },
  ]);

  // Mock Data: Bulletin Board
  const [bulletinData, setBulletinData] = useState([
    { id: '1', title: 'Cambio de aula: Estadística', date: '18 Nov', tag: 'Admin', color: '#EF4444' },
    { id: '2', title: 'Conferencia de IA y Ética', date: '20 Nov', tag: 'Evento', color: '#8B5CF6' },
    { id: '3', title: 'Plazo becas Erasmus', date: '01 Dic', tag: 'Beca', color: '#F59E0B' },
  ]);

  // Calculator State
  const [calcOpen, setCalcOpen] = useState(false);
  const [currentGrade, setCurrentGrade] = useState('');
  const [desiredGrade, setDesiredGrade] = useState('');
  const [examWeight, setExamWeight] = useState('');
  const [neededGrade, setNeededGrade] = useState(null);

  const toggleCalculator = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCalcOpen(!calcOpen);
  };

  const calculateGrade = () => {
    const cur = parseFloat(currentGrade);
    const des = parseFloat(desiredGrade);
    const weight = parseFloat(examWeight) / 100;

    if (isNaN(cur) || isNaN(des) || isNaN(weight) || weight === 0) return;

    // Formula: Desired = Current * (1 - Weight) + Exam * Weight
    // Exam = (Desired - Current * (1 - Weight)) / Weight
    const needed = (des - (cur * (1 - weight))) / weight;
    setNeededGrade(needed.toFixed(2));
  };

  const isClassActive = (timeString) => {
    // For demo purposes, we mock the current time or parse realistically
    // Format "HH:MM - HH:MM"
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHours * 60 + currentMinutes;

    const [start, end] = timeString.split(' - ');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTimeVal = startH * 60 + startM;
    const endTimeVal = endH * 60 + endM;

    // NOTE: For demo, you might want to force return true for one item if testing offline at odd hours
    return currentTimeVal >= startTimeVal && currentTimeVal < endTimeVal;
  };

  const getSubjectColor = (subject) => SUBJECT_COLORS[subject] || THEME_COLOR;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={28} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Universidad</Text>
      <TouchableOpacity style={styles.iconButton}>
        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );

  const renderCalculator = () => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity 
        onPress={toggleCalculator} 
        activeOpacity={0.8}
        style={styles.calculatorHeader}
      >
        <View style={styles.calcHeaderTitle}>
          <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="calculator-variant" size={20} color="#0284C7" />
          </View>
          <Text style={styles.sectionTitleNoMargin}>Calculadora de Promedio</Text>
        </View>
        <MaterialCommunityIcons 
          name={calcOpen ? "chevron-up" : "chevron-down"} 
          size={24} 
          color="#64748B" 
        />
      </TouchableOpacity>

      {calcOpen && (
        <View style={styles.calculatorBody}>
          <View style={styles.calcInputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nota Actual</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 8.5"
                keyboardType="numeric"
                value={currentGrade}
                onChangeText={setCurrentGrade}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nota Deseada</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 9.0"
                keyboardType="numeric"
                value={desiredGrade}
                onChangeText={setDesiredGrade}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Peso Examen %</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 40"
                keyboardType="numeric"
                value={examWeight}
                onChangeText={setExamWeight}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calcButton} onPress={calculateGrade}>
            <Text style={styles.calcButtonText}>Calcular Nota Necesaria</Text>
          </TouchableOpacity>

          {neededGrade !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Necesitas sacar un:</Text>
              <Text style={[
                styles.resultValue, 
                { color: parseFloat(neededGrade) > 10 ? '#EF4444' : '#10B981' }
              ]}>
                {neededGrade}
              </Text>
              {parseFloat(neededGrade) > 10 && (
                <Text style={styles.resultNote}>¡Imposible! (Mayor a 10)</Text>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderCountdownCard = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Próximo Evento Crítico</Text>
      <View style={[styles.countdownCard, { backgroundColor: getSubjectColor(nextEvent.subject) }]}>
        <View style={styles.countdownHeader}>
          <View style={styles.countdownBadge}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#FFF" />
            <Text style={styles.countdownBadgeText}>En {nextEvent.daysLeft} días</Text>
          </View>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FFF" style={{ opacity: 0.8 }} />
        </View>
        
        <View style={styles.countdownContent}>
          <Text style={styles.eventName}>{nextEvent.subject}</Text>
          <Text style={styles.eventType}>{nextEvent.type}</Text>
          
          <View style={styles.eventDetailsRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailText}>{nextEvent.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailText}>{nextEvent.location}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Horario de Hoy</Text>
        <Text style={styles.dateText}>Mié, 19 Nov</Text>
      </View>
      
      {schedule.map((cls, index) => {
        const active = isClassActive(cls.time);
        const subjectColor = getSubjectColor(cls.subject);
        
        return (
          <Animated.View 
            key={cls.id} 
            style={[
              styles.classCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.timeColumn}>
              <Text style={[styles.startTime, active && { color: subjectColor }]}>
                {cls.time.split(' - ')[0]}
              </Text>
              <Text style={styles.endTime}>{cls.time.split(' - ')[1]}</Text>
              <View style={[styles.timelineLine, index < schedule.length - 1 && { display: 'flex' }]} />
            </View>
            
            <View style={[
              styles.classInfoContainer,
              { borderLeftColor: subjectColor },
              active && styles.activeClassCard,
              active && { shadowColor: subjectColor }
            ]}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{cls.subject}</Text>
                {active && (
                  <View style={[styles.liveBadge, { backgroundColor: subjectColor }]}>
                    <Text style={styles.liveText}>AHORA</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.classDetailsRow}>
                <View style={[styles.typeBadge, { backgroundColor: cls.type === 'Laboratorio' ? '#E0F2FE' : '#FEF3C7' }]}>
                  <Text style={[styles.typeText, { color: cls.type === 'Laboratorio' ? '#0284C7' : '#D97706' }]}>
                    {cls.type}
                  </Text>
                </View>
                <View style={styles.classLocation}>
                  <MaterialCommunityIcons name="door-open" size={16} color="#64748B" />
                  <Text style={styles.roomText}>{cls.room}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );

  const renderGrades = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Registro de Notas</Text>
      <View style={styles.gradesContainer}>
        {grades.map((item) => (
          <View key={item.id} style={styles.gradeRow}>
            <View style={styles.gradeInfo}>
              <Text style={styles.gradeSubject}>{item.subject}</Text>
              <Text style={styles.gradeCredits}>{item.credits} créditos</Text>
            </View>
            <View style={[styles.gradeBadge, { backgroundColor: item.grade >= 9 ? '#DCFCE7' : item.grade >= 7 ? '#FEF9C3' : '#FEE2E2' }]}>
              <Text style={[styles.gradeValue, { color: item.grade >= 9 ? '#166534' : item.grade >= 7 ? '#854D0E' : '#991B1B' }]}>
                {item.grade}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLibrary = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Biblioteca Personal</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {libraryData.map((item) => (
          <View key={item.id} style={styles.libraryCard}>
            <View style={[styles.bookIconContainer, { backgroundColor: item.type === 'PDF' ? '#E0F2FE' : '#FEF3C7' }]}>
              <MaterialCommunityIcons 
                name={item.type === 'PDF' ? 'file-pdf-box' : 'book-open-variant'} 
                size={28} 
                color={item.type === 'PDF' ? '#0284C7' : '#D97706'} 
              />
            </View>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.bookStatus}>{item.status}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderProfessors = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Directorio de Profesores</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {professorsData.map((prof) => (
          <View key={prof.id} style={styles.profCard}>
            <View style={styles.profHeader}>
              <View style={styles.profAvatar}>
                <Text style={styles.profInitials}>{prof.name.charAt(0)}</Text>
              </View>
              <View style={styles.profInfo}>
                <Text style={styles.profName}>{prof.name}</Text>
                <Text style={styles.profSubject}>{prof.subject}</Text>
              </View>
            </View>
            <View style={styles.profContact}>
              <View style={styles.profContactRow}>
                <MaterialCommunityIcons name="email-outline" size={14} color="#64748B" />
                <Text style={styles.profContactText}>{prof.email}</Text>
              </View>
              <View style={styles.profContactRow}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#64748B" />
                <Text style={styles.profContactText}>{prof.hours}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderBulletinBoard = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Tablón de Anuncios</Text>
      <View style={styles.bulletinContainer}>
        {bulletinData.map((item, index) => (
          <View key={item.id} style={[styles.bulletinItem, index === bulletinData.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[styles.bulletinIcon, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name="bell-ring-outline" size={20} color={item.color} />
            </View>
            <View style={styles.bulletinContent}>
              <Text style={styles.bulletinTitle}>{item.title}</Text>
              <View style={styles.bulletinMeta}>
                <Text style={[styles.bulletinTag, { color: item.color }]}>{item.tag}</Text>
                <Text style={styles.bulletinDate}>{item.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderCountdownCard()}
        {renderCalculator()}
        {renderSchedule()}
        {renderLibrary()}
        {renderProfessors()}
        {renderBulletinBoard()}
        {renderGrades()}
        <View style={{ height: 40 }} /> 
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8FAFC',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  iconButton: {
    padding: 5,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 15,
  },
  sectionTitleNoMargin: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  // Calculator Styles
  calculatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 5,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calcHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    padding: 8,
    borderRadius: 10,
  },
  calculatorBody: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  calcInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  calcButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  calcButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  resultContainer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  resultNote: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  
  // Countdown Card Styles
  countdownCard: {
    backgroundColor: THEME_COLOR,
    borderRadius: 24,
    padding: 20,
    shadowColor: THEME_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownBadgeText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },
  countdownContent: {
    marginBottom: 5,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Schedule Styles
  classCard: {
    flexDirection: 'row',
    marginBottom: 0,
    minHeight: 100,
  },
  activeClassCard: {
    backgroundColor: '#FFF',
    borderColor: 'transparent',
    transform: [{ scale: 1.02 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  timeColumn: {
    width: 70,
    alignItems: 'flex-start',
    position: 'relative',
    paddingTop: 10,
  },
  startTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  endTime: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 18,
    top: 50,
    bottom: -20,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  classInfoContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: THEME_COLOR,
    justifyContent: 'center',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  classDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  classLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomText: {
    fontSize: 14,
    color: '#64748B',
  },
  // Grades Styles
  gradesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  gradeCredits: {
    fontSize: 13,
    color: '#94A3B8',
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // New Sections Styles
  horizontalScroll: {
    flexGrow: 0,
    marginBottom: 10,
  },
  libraryCard: {
    backgroundColor: '#FFF',
    width: 120,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  bookIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
    height: 36,
  },
  bookStatus: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  
  profCard: {
    backgroundColor: '#FFF',
    width: 200,
    borderRadius: 16,
    padding: 15,
    marginRight: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  profInfo: {
    flex: 1,
  },
  profName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  profSubject: {
    fontSize: 12,
    color: '#94A3B8',
  },
  profContact: {
    gap: 6,
  },
  profContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profContactText: {
    fontSize: 12,
    color: '#64748B',
  },
  
  bulletinContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bulletinItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  bulletinIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bulletinContent: {
    flex: 1,
  },
  bulletinTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  bulletinMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulletinTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  bulletinDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

export default UniversityScreen;