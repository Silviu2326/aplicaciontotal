import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Alert,
  Animated,
  Easing,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// --- MOCK DATA ---
const INITIAL_GOALS = [
  { 
    id: '1', 
    title: 'Ahorrar 10.000€', 
    category: 'Finanzas', 
    progress: 0.65, 
    daysLeft: 120, 
    color: '#10B981',
    icon: 'piggy-bank',
    gradient: ['#34D399', '#059669']
  },
  { 
    id: '2', 
    title: 'Correr Maratón', 
    category: 'Salud', 
    progress: 0.40, 
    daysLeft: 200, 
    color: '#F43F5E',
    icon: 'run',
    gradient: ['#FB7185', '#E11D48']
  },
  { 
    id: '3', 
    title: 'Leer 24 Libros', 
    category: 'Intelecto', 
    progress: 0.75, 
    daysLeft: 45, 
    color: '#3B82F6',
    icon: 'book-open-variant',
    gradient: ['#60A5FA', '#2563EB']
  },
];

const MONTHLY_MILESTONES = [
  { id: 'm1', title: 'Ahorrar 800€ este mes', completed: true, deadline: '30 Nov', goalId: '1' },
  { id: 'm2', title: 'Correr 50km en total', completed: false, deadline: '28 Nov', goalId: '2' },
  { id: 'm3', title: 'Terminar curso de React Native', completed: false, deadline: '15 Dic', goalId: '3' },
  { id: 'm4', title: 'Leer 2 libros', completed: true, deadline: '30 Nov', goalId: '3' },
];

const VISION_BOARD_ITEMS = [
  { id: 'v1', color: '#FEF2F2', icon: 'airplane', label: 'Viajar a Japón', height: 180, image: null },
  { id: 'v2', color: '#EFF6FF', icon: 'home-city', label: 'Casa Propia', height: 120, image: null },
  { id: 'v3', color: '#F0FDF4', icon: 'tree', label: 'Naturaleza', height: 140, image: null },
  { id: 'v4', color: '#FFFBEB', icon: 'camera', label: 'Fotografía', height: 160, image: null },
  { id: 'v5', color: '#FDF4FF', icon: 'palette', label: 'Arte', height: 130, image: null },
  { id: 'v6', color: '#F5F3FF', icon: 'brain', label: 'Aprender IA', height: 150, image: null },
];

const UNLOCKED_MEDALS = [
  { id: 'md1', name: 'Primer Paso', icon: 'shoe-print', color: '#CD7F32', earned: true },
  { id: 'md2', name: 'Ahorrador', icon: 'piggy-bank', color: '#C0C0C0', earned: true },
  { id: 'md3', name: 'Maratonista', icon: 'run-fast', color: '#FFD700', earned: false },
  { id: 'md4', name: 'Ratón de Biblio', icon: 'book-open-page-variant', color: '#A855F7', earned: false },
];

const MENTORS = [
  { id: 'mt1', name: 'James Clear', role: 'Hábitos Atómicos', icon: 'atom', color: '#F59E0B' },
  { id: 'mt2', name: 'Naval Ravikant', role: 'Filosofía & Riqueza', icon: 'meditation', color: '#8B5CF6' },
  { id: 'mt3', name: 'Andrew Huberman', role: 'Neurociencia', icon: 'brain', color: '#10B981' },
  { id: 'mt4', name: 'Tim Ferriss', role: 'Productividad', icon: 'clock-fast', color: '#EF4444' },
];

// --- ANIMATION UTILS ---
const ConfettiPiece = ({ delay }) => {
  const animY = useRef(new Animated.Value(-50)).current;
  const animX = useRef(new Animated.Value(Math.random() * width)).current;
  const animRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animY, {
          toValue: height + 50,
          duration: 2500 + Math.random() * 1000,
          useNativeDriver: false,
          easing: Easing.out(Easing.quad)
        }),
        Animated.timing(animRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  const spin = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: animY,
        left: animX,
        width: 10,
        height: 10,
        backgroundColor: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)],
        transform: [{ rotate: spin }],
        zIndex: 9999,
      }} 
    />
  );
};

// --- COMPONENTS ---

const ProgressBar = ({ progress, gradient }) => (
  <View style={styles.progressContainer}>
    <LinearGradient
      colors={gradient || ['#F59E0B', '#EF4444']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.progressFill, { width: `${progress * 100}%` }]}
    />
  </View>
);

const GoalCard = ({ item }) => (
  <TouchableOpacity style={styles.goalCard} activeOpacity={0.9} onPress={() => Alert.alert('Detalle Meta', item.title)}>
    <View style={styles.goalHeader}>
      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.daysTag}>
        <Text style={[styles.daysText, { color: item.color }]}>{item.daysLeft} días restan</Text>
      </View>
    </View>
    
    <View style={styles.goalContent}>
      <Text style={styles.goalCategory}>{item.category}</Text>
      <Text style={styles.goalTitle}>{item.title}</Text>
    </View>

    <View style={styles.goalFooter}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
        <ProgressBar progress={item.progress} gradient={item.gradient} />
      </View>
    </View>
  </TouchableOpacity>
);

const MilestoneItem = ({ item, onToggle }) => (
  <TouchableOpacity style={styles.milestoneRow} onPress={onToggle} activeOpacity={0.7}>
    <View style={[styles.checkCircle, item.completed && styles.checkCircleActive]}>
      {item.completed && <MaterialCommunityIcons name="check-bold" size={14} color="#fff" />}
    </View>
    <View style={styles.milestoneContent}>
      <Text style={[styles.milestoneTitle, item.completed && styles.textDone]}>{item.title}</Text>
      <Text style={styles.milestoneDate}>Límite: {item.deadline}</Text>
    </View>
  </TouchableOpacity>
);

const VisionMasonryItem = ({ item }) => (
  <TouchableOpacity style={[styles.masonryItem, { height: item.height, backgroundColor: item.color }]}>
    <MaterialCommunityIcons 
      name={item.icon} 
      size={36} 
      color={item.color.replace('F2', 'B9').replace('EB', 'B4').replace('FF', '3B')} 
      style={{ opacity: 0.9 }} 
    />
    <Text style={styles.visionLabel}>{item.label}</Text>
  </TouchableOpacity>
);

const MedalItem = ({ item }) => (
  <View style={[styles.medalItem, !item.earned && styles.medalLocked]}>
    <View style={[styles.medalCircle, { backgroundColor: item.earned ? item.color + '20' : '#F1F5F9' }]}>
      <MaterialCommunityIcons 
        name={item.earned ? 'trophy' : 'lock'} 
        size={24} 
        color={item.earned ? item.color : '#CBD5E1'} 
      />
    </View>
    <Text style={[styles.medalName, !item.earned && { color: '#94A3B8' }]}>{item.name}</Text>
  </View>
);

const Heatmap = () => {
  // Generate mock heatmap data (12 weeks x 7 days)
  const data = Array.from({ length: 7 * 12 }).map((_, i) => {
    const rand = Math.random();
    let level = 0;
    if (rand > 0.85) level = 3; // High
    else if (rand > 0.6) level = 2; // Med
    else if (rand > 0.3) level = 1; // Low
    return level;
  });

  const getColor = (level) => {
    switch(level) {
      case 3: return '#10B981'; // Emerald 500
      case 2: return '#6EE7B7'; // Emerald 300
      case 1: return '#D1FAE5'; // Emerald 100
      default: return '#F1F5F9'; // Slate 100
    }
  };

  return (
    <View style={styles.heatmapContainer}>
      <View style={styles.heatmapGrid}>
        {data.map((level, i) => (
          <View 
            key={i} 
            style={[styles.heatmapSquare, { backgroundColor: getColor(level) }]} 
          />
        ))}
      </View>
      <View style={styles.heatmapLegend}>
        <Text style={styles.legendText}>Menos</Text>
        <View style={styles.legendColors}>
          {[0, 1, 2, 3].map(l => (
            <View key={l} style={[styles.legendDot, { backgroundColor: getColor(l) }]} />
          ))}
        </View>
        <Text style={styles.legendText}>Más</Text>
      </View>
    </View>
  );
};

const MentorCard = ({ item }) => (
  <TouchableOpacity style={styles.mentorCard}>
    <View style={[styles.mentorAvatar, { backgroundColor: item.color + '20' }]}>
      <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
    </View>
    <View style={styles.mentorInfo}>
      <Text style={styles.mentorName}>{item.name}</Text>
      <Text style={styles.mentorRole}>{item.role}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
  </TouchableOpacity>
);

export default function GoalsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [milestones, setMilestones] = useState(MONTHLY_MILESTONES);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gratitude, setGratitude] = useState(['', '', '']);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const toggleMilestone = (id) => {
    let completedNow = false;
    let targetGoalId = null;

    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        completedNow = !m.completed;
        targetGoalId = m.goalId;
        return { ...m, completed: !m.completed };
      }
      return m;
    }));

    if (targetGoalId) {
      setGoals(prevGoals => prevGoals.map(goal => {
        if (goal.id === targetGoalId) {
          // Increment/Decrement progress by 5% for demo purposes
          const change = completedNow ? 0.05 : -0.05;
          const newProgress = Math.max(0, Math.min(1, goal.progress + change));
          return { ...goal, progress: newProgress };
        }
        return goal;
      }));
    }

    if (completedNow) {
      triggerConfetti();
    }
  };

  const updateGratitude = (text, index) => {
    const newGratitude = [...gratitude];
    newGratitude[index] = text;
    setGratitude(newGratitude);
  };

  // Masonry Logic
  const col1 = VISION_BOARD_ITEMS.filter((_, i) => i % 2 === 0);
  const col2 = VISION_BOARD_ITEMS.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <View style={[styles.bgHeader, { height: insets.top + 60 }]} />

      {/* Confetti Overlay */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {[...Array(30)].map((_, i) => (
            <ConfettiPiece key={i} delay={i * 50} />
          ))}
        </View>
      )}

      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        
        {/* Navigation Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Objetivos</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => Alert.alert('Nuevo Objetivo', 'Crear nueva meta anual o hito mensual')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* Rewards Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trofeos y Logros</Text>
              <TouchableOpacity><Text style={styles.seeAll}>Ver Sala</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medalsScroll} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {UNLOCKED_MEDALS.map(medal => (
                <MedalItem key={medal.id} item={medal} />
              ))}
            </ScrollView>
          </View>

          {/* NEW: Gratitude Journal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diario de Gratitud</Text>
            <Text style={styles.sectionSubtitleWrapper}>3 cosas positivas de hoy</Text>
            <View style={styles.gratitudeContainer}>
              {gratitude.map((entry, i) => (
                <View key={i} style={styles.gratitudeInputWrapper}>
                  <Text style={styles.gratitudeNumber}>{i + 1}.</Text>
                  <TextInput
                    style={styles.gratitudeInput}
                    placeholder="Estoy agradecido por..."
                    placeholderTextColor="#94A3B8"
                    value={entry}
                    onChangeText={(text) => updateGratitude(text, i)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Annual Goals Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Metas Anuales</Text>
              <TouchableOpacity><Text style={styles.seeAll}>Ver todo</Text></TouchableOpacity>
            </View>
            <View style={styles.goalsGrid}>
              {goals.map(goal => (
                <GoalCard key={goal.id} item={goal} />
              ))}
            </View>
          </View>

          {/* Monthly Milestones Section (Gamified List) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Misiones del Mes</Text>
              <View style={styles.xpBadge}>
                <MaterialCommunityIcons name="lightning-bolt" size={14} color="#F59E0B" />
                <Text style={styles.xpText}>{milestones.filter(m => m.completed).length * 100} XP</Text>
              </View>
            </View>
            <View style={styles.cardContainer}>
              {milestones.map((item, index) => (
                <React.Fragment key={item.id}>
                  <MilestoneItem item={item} onToggle={() => toggleMilestone(item.id)} />
                  {index < milestones.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* NEW: Habit Streak (Heatmap) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Racha de Hábitos</Text>
            <Text style={styles.sectionSubtitleWrapper}>Consistencia últimos 90 días</Text>
            <Heatmap />
          </View>

          {/* Vision Board Section (Masonry) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vision Board</Text>
            <Text style={styles.sectionSubtitleWrapper}>Visualiza tu futuro</Text>
            
            <View style={styles.masonryContainer}>
              <View style={styles.masonryColumn}>
                {col1.map(item => <VisionMasonryItem key={item.id} item={item} />)}
              </View>
              <View style={styles.masonryColumn}>
                {col2.map(item => <VisionMasonryItem key={item.id} item={item} />)}
              </View>
            </View>
          </View>

          {/* NEW: Mentors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mentores</Text>
            <Text style={styles.sectionSubtitleWrapper}>Fuentes de inspiración</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mentorsScroll}>
              {MENTORS.map(mentor => (
                <View key={mentor.id} style={styles.mentorWrapper}>
                  <MentorCard item={mentor} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  addButton: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800', // Bolder
    color: '#0F172A',
    paddingHorizontal: 20, 
    marginBottom: 4,
  },
  sectionSubtitleWrapper: {
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    marginTop: -2,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  
  // Medals
  medalsScroll: {
    marginTop: 0,
  },
  medalItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  medalCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  medalLocked: {
    opacity: 0.6,
  },
  medalName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },

  // Gratitude
  gratitudeContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  gratitudeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  gratitudeNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginRight: 8,
    width: 16,
  },
  gratitudeInput: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },

  // Heatmap
  heatmapContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  heatmapSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  heatmapLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  legendColors: {
    flexDirection: 'row',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Mentors
  mentorsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  mentorWrapper: {
    marginRight: 12,
    width: 200,
  },
  mentorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mentorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  mentorRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Vision Board Masonry
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  masonryItem: {
    width: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  visionLabel: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },

  // Goals
  goalsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  daysText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalContent: {
    marginBottom: 20,
  },
  goalCategory: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  goalFooter: {
    width: '100%',
  },
  progressRow: {
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    alignSelf: 'flex-end',
  },
  progressContainer: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  // Milestones
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginLeft: 2,
  },
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 6, // Tighter padding for internal look
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  checkCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    color: '#334155',
    fontWeight: '600',
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
    fontWeight: '400',
  },
  milestoneDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 14,
  },
});
