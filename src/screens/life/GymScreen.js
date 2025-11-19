import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Alert,
  Easing,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- CONFIGURATION ---
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

// --- THEMES ---
const COLORS = {
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    textSub: '#64748B',
    primary: '#6366F1',
    accent: '#818CF8',
    border: '#F1F5F9',
    success: '#10B981',
    error: '#EF4444',
    chartBg: '#F1F5F9',
  },
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    text: '#F8FAFC',
    textSub: '#94A3B8',
    primary: '#818CF8',
    accent: '#6366F1',
    border: '#334155',
    success: '#34D399',
    error: '#EF4444',
    chartBg: '#334155',
  }
};

// --- MOCK DATA ---
const TRAINING_DATES = {
  '2025-11-01': { marked: true, dotColor: '#6366F1' },
  '2025-11-03': { marked: true, dotColor: '#6366F1' },
  '2025-11-05': { marked: true, dotColor: '#6366F1' },
  '2025-11-07': { marked: true, dotColor: '#6366F1' },
  '2025-11-10': { marked: true, dotColor: '#6366F1' },
  '2025-11-12': { marked: true, dotColor: '#6366F1' },
  '2025-11-14': { marked: true, dotColor: '#6366F1' },
  '2025-11-19': { selected: true, marked: true, selectedColor: '#6366F1' },
};

const RECOVERY_STATUS = {
  chest: { level: 'high', color: '#EF4444' }, // Tired
  legs: { level: 'medium', color: '#F59E0B' }, // Recovering
  arms: { level: 'low', color: '#10B981' }, // Fresh
  abs: { level: 'low', color: '#10B981' },
  shoulders: { level: 'medium', color: '#F59E0B' }
};

const TUTORIALS = [
  { id: 't1', title: 'Técnica Perfecta de Press Banca', duration: '5:20', color: '#1E293B' },
  { id: 't2', title: 'Evita Dolor de Hombro', duration: '8:15', color: '#334155' },
  { id: 't3', title: 'Hipertrofia en Piernas', duration: '12:00', color: '#475569' },
  { id: 't4', title: 'Rutina de Abdominales', duration: '6:30', color: '#64748B' },
];

const STRENGTH_HISTORY = [
  { date: '1 Oct', value: 90 },
  { date: '15 Oct', value: 92.5 },
  { date: '1 Nov', value: 95 },
  { date: '15 Nov', value: 95 },
  { date: 'Today', value: 100 },
];

const TODAYS_ROUTINE = {
  id: 'r1',
  name: 'Push Power',
  subtitle: 'Pecho • Hombro • Tríceps',
  duration: '90 min',
  calories: '450 kcal',
  muscleGroupIcon: 'arm-flex',
};

const INITIAL_EXERCISES = [
  { id: 'e1', name: 'Press Banca', sets: 4, defaultReps: '8', defaultWeight: '80', lastWeight: '77.5kg', rest: 90 },
  { id: 'e2', name: 'Press Militar', sets: 3, defaultReps: '10', defaultWeight: '24', lastWeight: '22kg', rest: 60 },
  { id: 'e3', name: 'Elev. Laterales', sets: 4, defaultReps: '15', defaultWeight: '12', lastWeight: '12kg', rest: 45 },
];

// --- COMPONENTS ---

// 1. Simple Line Chart (No SVG)
const LineChart = ({ data, height = 100, width = SCREEN_WIDTH - 80, color }) => {
  if (!data || data.length < 2) return null;

  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value)) * 0.9;
  const range = maxVal - minVal;
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.value - minVal) / range) * height,
    val: d.value,
    date: d.date
  }));

  return (
    <View style={{ height, width, marginVertical: 20 }}>
      {/* Grid Lines */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: color + '20' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: color + '20' }} />
      
      {/* Lines */}
      {points.map((p, i) => {
        if (i === points.length - 1) return null;
        const next = points[i + 1];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: p.x + dx / 2 - length / 2,
              top: p.y + dy / 2 - 1, // 1 is half thickness
              width: length,
              height: 2,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* Dots */}
      {points.map((p, i) => (
        <View key={'dot'+i} style={{ position: 'absolute', left: p.x - 4, top: p.y - 4, alignItems: 'center' }}>
           <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
           {i === points.length - 1 && (
             <Text style={{ position: 'absolute', top: -20, color, fontSize: 10, fontWeight: 'bold', width: 50, textAlign: 'center' }}>
               {p.val}kg
             </Text>
           )}
        </View>
      ))}
    </View>
  );
};

// 2. Rest Timer
const RestTimer = ({ seconds, isRunning, onCancel, onAdd }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeLeft(seconds);
    progress.setValue(1);
    if (isRunning) {
       Animated.timing(progress, {
         toValue: 0,
         duration: seconds * 1000,
         useNativeDriver: false,
         easing: Easing.linear
       }).start();
    }
  }, [seconds, isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      onCancel(); // Done
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isRunning]);

  if (!isRunning) return null;

  return (
    <View style={styles.timerFloatingContainer}>
      <View style={styles.timerContent}>
        <View style={styles.timerTextContainer}>
          <Text style={styles.timerLabel}>DESCANSO</Text>
          <Text style={styles.timerValue}>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</Text>
        </View>
        <View style={styles.timerControls}>
          <TouchableOpacity onPress={() => setTimeLeft(t => t + 30)} style={styles.timerBtn}>
            <Text style={styles.timerBtnText}>+30s</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={[styles.timerBtn, { backgroundColor: '#EF4444' }]}>
             <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View 
        style={[
          styles.timerBar, 
          { 
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%']
            }) 
          }
        ]} 
      />
    </View>
  );
};

// 3. Body Recovery Visual
const BodyRecoveryView = ({ theme }) => {
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
      <View style={styles.sectionHeaderContainer}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Estado de Recuperación</Text>
        <MaterialCommunityIcons name="human-handsup" size={20} color={theme.primary} />
      </View>
      <Text style={{ color: theme.textSub, fontSize: 12, marginBottom: 20 }}>Monitor de fatiga muscular</Text>

      <View style={styles.bodyContainer}>
        <Svg height="200" width="150" viewBox="0 0 100 200">
          {/* Head */}
          <Circle cx="50" cy="20" r="12" fill={theme.textSub} opacity="0.3" />
          
          {/* Torso/Chest (Chest Status) */}
          <Rect x="35" y="35" width="30" height="40" rx="5" fill={RECOVERY_STATUS.chest.color} />
          
          {/* Abs */}
          <Rect x="38" y="78" width="24" height="25" rx="2" fill={RECOVERY_STATUS.abs.color} />
          
          {/* Arms (Arms Status) */}
          <Rect x="10" y="38" width="20" height="60" rx="5" fill={RECOVERY_STATUS.arms.color} />
          <Rect x="70" y="38" width="20" height="60" rx="5" fill={RECOVERY_STATUS.arms.color} />
          
          {/* Legs (Legs Status) */}
          <Rect x="35" y="105" width="13" height="80" rx="5" fill={RECOVERY_STATUS.legs.color} />
          <Rect x="52" y="105" width="13" height="80" rx="5" fill={RECOVERY_STATUS.legs.color} />
        </Svg>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
             <Text style={[styles.legendText, { color: theme.textSub }]}>Fatigado (48h+)</Text>
          </View>
          <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
             <Text style={[styles.legendText, { color: theme.textSub }]}>Recuperando</Text>
          </View>
          <View style={styles.legendItem}>
             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
             <Text style={[styles.legendText, { color: theme.textSub }]}>Listo</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 4. Tutorials List
const TutorialsList = ({ theme }) => {
  return (
    <View style={{ marginBottom: 20 }}>
       <Text style={[styles.sectionHeader, { color: theme.text }]}>Aprende y Mejora</Text>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {TUTORIALS.map((tut) => (
             <TouchableOpacity key={tut.id} style={[styles.tutorialCard, { backgroundColor: theme.card }]}>
                <View style={[styles.tutorialThumb, { backgroundColor: tut.color }]}>
                   <MaterialCommunityIcons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
                   <Text style={styles.durationBadge}>{tut.duration}</Text>
                </View>
                <Text style={[styles.tutorialTitle, { color: theme.text }]} numberOfLines={2}>{tut.title}</Text>
             </TouchableOpacity>
          ))}
       </ScrollView>
    </View>
  );
};

// --- MAIN SCREEN ---

export default function GymScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? COLORS.dark : COLORS.light;

  // --- WORKOUT STATE ---
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(true);
  
  // Initialize exercises with set state
  const [exercises, setExercises] = useState(() => {
    return INITIAL_EXERCISES.map(ex => ({
      ...ex,
      setDetails: Array.from({ length: ex.sets }).map(() => ({
        completed: false,
        weight: ex.defaultWeight,
        reps: ex.defaultReps,
      }))
    }));
  });

  // Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  // Edit Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSet, setEditingSet] = useState(null); // { exerciseIndex, setIndex, weight, reps }
  const [tempWeight, setTempWeight] = useState('');
  const [tempReps, setTempReps] = useState('');

  // --- EFFECTS ---

  // Stopwatch logic
  useEffect(() => {
    let interval = null;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutDuration(prev => prev + 1);
      }, 1000);
    } else if (!isWorkoutActive && workoutDuration !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, workoutDuration]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---

  const triggerRest = (duration) => {
    setTimerDuration(duration);
    setTimerActive(true);
  };

  const handleToggleSet = (exIndex, setIndex) => {
    const newExercises = [...exercises];
    const set = newExercises[exIndex].setDetails[setIndex];
    
    // Toggle completion
    set.completed = !set.completed;
    setExercises(newExercises);

    // If completing, trigger rest
    if (set.completed) {
      triggerRest(newExercises[exIndex].rest);
    }
  };

  const openEditModal = (exIndex, setIndex) => {
    const set = exercises[exIndex].setDetails[setIndex];
    setEditingSet({ exIndex, setIndex });
    setTempWeight(set.weight);
    setTempReps(set.reps);
    setModalVisible(true);
  };

  const saveSetDetails = () => {
    if (editingSet) {
      const { exIndex, setIndex } = editingSet;
      const newExercises = [...exercises];
      newExercises[exIndex].setDetails[setIndex] = {
        ...newExercises[exIndex].setDetails[setIndex],
        weight: tempWeight,
        reps: tempReps
      };
      setExercises(newExercises);
      setModalVisible(false);
      setEditingSet(null);
    }
  };

  const finishWorkout = () => {
    setIsWorkoutActive(false);
    Alert.alert(
      "¡Entrenamiento Terminado!", 
      `Duración: ${formatDuration(workoutDuration)}\nBuen trabajo.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.bgHeader, { height: insets.top + 60, backgroundColor: theme.primary }]} />

      {/* HEADER */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gimnasio</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
           <TouchableOpacity style={styles.iconButton} onPress={() => setIsDark(!isDark)}>
             <MaterialCommunityIcons name={isDark ? "white-balance-sunny" : "weather-night"} size={24} color="#fff" />
           </TouchableOpacity>
           <TouchableOpacity style={styles.iconButton}>
             <MaterialCommunityIcons name="dots-horizontal" size={24} color="#fff" />
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* ROUTINE CARD (Active Workout) */}
        <View style={[styles.card, { marginTop: 10 }]}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                 <Text style={styles.cardLabel}>RUTINA DE HOY</Text>
                 <Text style={styles.cardTitle}>{TODAYS_ROUTINE.name}</Text>
                 <Text style={styles.cardSubtitle}>{TODAYS_ROUTINE.subtitle}</Text>
              </View>
              <View style={[styles.iconBubble, { backgroundColor: theme.primary }]}>
                 <MaterialCommunityIcons name="dumbbell" size={30} color="#fff" />
              </View>
           </View>
           <View style={styles.divider} />
           <View style={styles.statRow}>
              {/* Workout Timer */}
              <View style={[styles.timerBadge, { backgroundColor: theme.primary + '20' }]}>
                 <MaterialCommunityIcons name="timer-outline" size={16} color={theme.primary} />
                 <Text style={[styles.statText, { color: theme.primary, fontWeight: 'bold' }]}>
                   {formatDuration(workoutDuration)}
                 </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 15 }}>
                 <MaterialCommunityIcons name="fire" size={16} color="#94A3B8" />
                 <Text style={styles.statText}>{TODAYS_ROUTINE.calories}</Text>
              </View>
           </View>
        </View>

        {/* BODY RECOVERY STATUS */}
        <BodyRecoveryView theme={theme} />

        {/* EXERCISES */}
        <Text style={[styles.sectionHeader, { color: theme.text }]}>Sesión Actual</Text>
        {exercises.map((ex, exIndex) => (
          <View key={ex.id} style={[styles.exerciseCard, { backgroundColor: theme.card }]}>
             <View style={styles.exHeader}>
                <Text style={[styles.exIndex, { color: theme.textSub }]}>#{exIndex+1}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                   <Text style={[styles.exName, { color: theme.text }]}>{ex.name}</Text>
                   <Text style={{ color: theme.textSub, fontSize: 12 }}>
                     {ex.sets} series • {ex.defaultReps} reps
                   </Text>
                </View>
                <TouchableOpacity>
                   <MaterialCommunityIcons name="history" size={20} color={theme.textSub} />
                </TouchableOpacity>
             </View>
             
             <View style={styles.setRowContainer}>
                <View style={styles.setHeaderRow}>
                   <Text style={[styles.colHeader, { width: 30 }]}>SET</Text>
                   <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>PREV</Text>
                   <Text style={[styles.colHeader, { width: 60, textAlign: 'center' }]}>KG</Text>
                   <Text style={[styles.colHeader, { width: 50, textAlign: 'center' }]}>REPS</Text>
                   <Text style={[styles.colHeader, { width: 40 }]}></Text>
                </View>

                {ex.setDetails.map((set, setIndex) => (
                   <TouchableOpacity 
                      key={setIndex}
                      style={[
                        styles.setRow, 
                        set.completed && { backgroundColor: theme.success + '10' }
                      ]}
                      onLongPress={() => openEditModal(exIndex, setIndex)}
                      activeOpacity={0.7}
                   >
                      <View style={styles.setNumberBubble}>
                         <Text style={{ fontSize: 10, color: theme.textSub, fontWeight: 'bold' }}>{setIndex + 1}</Text>
                      </View>
                      
                      <Text style={[styles.setPrevText, { color: theme.textSub }]}>{ex.lastWeight}</Text>
                      
                      <TouchableOpacity 
                        onPress={() => openEditModal(exIndex, setIndex)}
                        style={styles.inputLike}
                      >
                        <Text style={{ color: theme.text, fontWeight: '600' }}>{set.weight}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        onPress={() => openEditModal(exIndex, setIndex)}
                        style={styles.inputLike}
                      >
                         <Text style={{ color: theme.text, fontWeight: '600' }}>{set.reps}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                         style={[
                            styles.checkbox, 
                            { borderColor: set.completed ? theme.success : theme.border },
                            set.completed && { backgroundColor: theme.success }
                         ]}
                         onPress={() => handleToggleSet(exIndex, setIndex)}
                      >
                         {set.completed && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                      </TouchableOpacity>
                   </TouchableOpacity>
                ))}
             </View>
          </View>
        ))}

        {/* FINISH WORKOUT BUTTON */}
        <TouchableOpacity 
          style={[styles.finishButton, { backgroundColor: theme.primary }]}
          onPress={finishWorkout}
        >
           <Text style={styles.finishButtonText}>Terminar Entrenamiento</Text>
           <MaterialCommunityIcons name="flag-checkered" size={20} color="#fff" />
        </TouchableOpacity>

        {/* TRAINING HISTORY */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, padding: 0, overflow: 'hidden', marginTop: 20 }]}>
           <View style={{ padding: 20, paddingBottom: 10 }}>
             <Text style={[styles.sectionTitle, { color: theme.text }]}>Historial</Text>
           </View>
           <Calendar
             theme={{
               calendarBackground: theme.card,
               textSectionTitleColor: theme.textSub,
               selectedDayBackgroundColor: theme.primary,
               selectedDayTextColor: '#ffffff',
               todayTextColor: theme.primary,
               dayTextColor: theme.text,
               textDisabledColor: '#d9e1e8',
               dotColor: theme.primary,
               selectedDotColor: '#ffffff',
               arrowColor: theme.primary,
               monthTextColor: theme.text,
               indicatorColor: theme.primary,
             }}
             markedDates={TRAINING_DATES}
             firstDay={1}
           />
        </View>

        {/* STRENGTH CHART */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
           <Text style={[styles.sectionTitle, { color: theme.text }]}>Progreso: Press Banca</Text>
           <Text style={{ color: theme.success, fontWeight: 'bold', fontSize: 24 }}>+10kg <Text style={{ fontSize: 14, color: theme.textSub, fontWeight: 'normal' }}>vs mes pasado</Text></Text>
           <LineChart data={STRENGTH_HISTORY} color={theme.primary} />
        </View>

        {/* TUTORIALS */}
        <TutorialsList theme={theme} />

      </ScrollView>

      {/* REST TIMER OVERLAY */}
      <RestTimer 
        seconds={timerDuration} 
        isRunning={timerActive} 
        onCancel={() => setTimerActive(false)} 
      />

      {/* EDIT SET MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           style={styles.modalOverlay}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
             <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Serie</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                   <MaterialCommunityIcons name="close" size={24} color={theme.textSub} />
                </TouchableOpacity>
             </View>
             
             <View style={styles.modalBody}>
                <View style={styles.inputGroup}>
                   <Text style={[styles.inputLabel, { color: theme.textSub }]}>Peso (kg)</Text>
                   <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                      value={tempWeight}
                      onChangeText={setTempWeight}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSub}
                   />
                </View>
                <View style={styles.inputGroup}>
                   <Text style={[styles.inputLabel, { color: theme.textSub }]}>Repeticiones</Text>
                   <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.bg }]}
                      value={tempReps}
                      onChangeText={setTempReps}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={theme.textSub}
                   />
                </View>
             </View>

             <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={saveSetDetails}
             >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  },
  bgHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 24,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12, 
    color: '#818CF8', 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  iconBubble: {
    width: 50, height: 50,
    borderRadius: 16,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 15,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    color: '#64748B',
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Recovery
  bodyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendContainer: {
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10, height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Tutorials
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  tutorialCard: {
    width: 160,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 12,
    elevation: 2,
  },
  tutorialThumb: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tutorialTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  // Exercises List
  exerciseCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    elevation: 2,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  exIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.5,
  },
  exName: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Set Table
  setRowContainer: {
    marginTop: 5,
  },
  setHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  colHeader: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  setNumberBubble: {
    width: 30,
    alignItems: 'center',
  },
  setPrevText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  inputLike: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  checkbox: {
    width: 24, height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Timer
  timerFloatingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20, right: 20,
    backgroundColor: '#1E293B',
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timerTextContainer: {
    flex: 1,
  },
  timerLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  timerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerBar: {
    height: 4,
    backgroundColor: '#6366F1',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  // Finish Button
  finishButton: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  saveButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});