import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  FlatList,
  Alert,
  Modal,
  Animated,
  Pressable,
  Easing,
  Image,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// --- CONSTANTS & THEME ---
const THEME_COLOR = '#4F46E5'; // Indigo 600
const BG_COLOR = '#F1F5F9';
const GLASS_BG = 'rgba(255, 255, 255, 0.85)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.6)';

const INITIAL_PROJECTS = [
  { id: '1', name: 'Rediseño Web', client: 'TechSolutions', progress: 0.75, color: '#3B82F6', daysLeft: 5, icon: 'monitor-shimmer' },
  { id: '2', name: 'App Móvil', client: 'Foodie Inc.', progress: 0.40, color: '#10B981', daysLeft: 12, icon: 'cellphone-text' },
  { id: '3', name: 'Campaña Q4', client: 'MarketingPro', progress: 0.90, color: '#F59E0B', daysLeft: 2, icon: 'rocket-launch' },
];

const TEAM_MEMBERS = [
  { id: '1', name: 'Ana G.', status: 'online', role: 'Designer', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: '2', name: 'Carlos R.', status: 'meeting', role: 'Product Manager', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: '3', name: 'Elena W.', status: 'ooo', role: 'Developer', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: '4', name: 'David L.', status: 'online', role: 'Backend', image: 'https://randomuser.me/api/portraits/men/86.jpg' },
];

const RESOURCES = [
  { id: '1', name: 'Drive', icon: 'google-drive', color: '#1FA463' },
  { id: '2', name: 'Slack', icon: 'slack', color: '#4A154B' },
  { id: '3', name: 'Jira', icon: 'jira', color: '#0052CC' },
  { id: '4', name: 'Figma', icon: 'pencil-ruler', color: '#F24E1E' },
];

const CONTACTS = [
  { id: '1', name: 'Ana García', role: 'CEO @ Tech', initial: 'A', color: '#EC4899', email: 'ana@tech.com' },
  { id: '2', name: 'Carlos Ruiz', role: 'PM @ Foodie', initial: 'C', color: '#6366F1', email: 'carlos@foodie.com' },
  { id: '3', name: 'Elena Web', role: 'Dev @ Studio', initial: 'E', color: '#10B981', email: 'elena@studio.com' },
];

const INITIAL_TASKS = [
  { id: '1', title: 'Enviar presupuesto final', priority: 'high', completed: false, tag: 'Ventas' },
  { id: '2', title: 'Revisar PR de autenticación', priority: 'medium', completed: true, tag: 'Dev' },
  { id: '3', title: 'Meeting con cliente (Kickoff)', priority: 'high', completed: false, tag: 'Reunión' },
  { id: '4', title: 'Actualizar documentación', priority: 'low', completed: false, tag: 'Docs' },
];

// --- HELPER COMPONENTS ---

// Improved Circular Progress (Visual Trick using borders)
const ModernCircularProgress = ({ size = 50, progress, color }) => {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size/2,
        borderWidth: 4, borderColor: color + '20' 
      }} />
      {/* Indicator - Simplified as a "Badge" style for robustness */}
      <View style={{
        width: size - 8, height: size - 8, borderRadius: (size-8)/2,
        backgroundColor: color + '10', alignItems: 'center', justifyContent: 'center'
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: color }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
      {/* Active Dot simulating progress tip */}
      <View style={{
        position: 'absolute', top: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: color,
        transform: [{ translateY: -2 }]
      }} />
    </View>
  );
};

// 2. Scalable Interactive Card
const ScaleCard = ({ children, onPress, style }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const FocusModal = ({ visible, onClose }) => {
  const [seconds, setSeconds] = useState(25 * 60); // 25 min default
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      Alert.alert("¡Tiempo terminado!", "Tómate un descanso.");
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Modo Enfoque</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.timerLabel}>POMODORO</Text>
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity 
              style={[styles.controlBtn, { backgroundColor: isActive ? '#EF4444' : '#10B981' }]}
              onPress={() => setIsActive(!isActive)}
            >
              <MaterialCommunityIcons name={isActive ? "pause" : "play"} size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlBtn, { backgroundColor: '#E2E8F0' }]}
              onPress={() => { setIsActive(false); setSeconds(25*60); }}
            >
              <MaterialCommunityIcons name="refresh" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function WorkScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [focusVisible, setFocusVisible] = useState(false);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [noteText, setNoteText] = useState('');
  const [sortedByPriority, setSortedByPriority] = useState(false);

  // --- ACTIONS ---

  const openProject = (project) => {
    Alert.alert(
      `Proyecto: ${project.name}`,
      `Cliente: ${project.client}\nProgreso: ${Math.round(project.progress * 100)}%\nDías restantes: ${project.daysLeft}`,
      [{ text: "Ver Detalles", onPress: () => console.log("Navigating to project details") }, { text: "Cerrar" }]
    );
  };

  const openResource = (resource) => {
    Alert.alert(
      `Abrir ${resource.name}`,
      "¿Deseas abrir esta herramienta externa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir", onPress: () => console.log(`Opening ${resource.name}`) }
      ]
    );
  };

  const toggleTask = (id) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSortTasks = () => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    
    if (sortedByPriority) {
      // Reset to original (by ID roughly or unsorted)
      setTasks([...INITIAL_TASKS]); // Ideally we'd have a more robust sort restoration
      Alert.alert("Orden", "Orden original restaurado");
    } else {
      const sorted = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      setTasks(sorted);
      Alert.alert("Orden", "Tareas ordenadas por prioridad");
    }
    setSortedByPriority(!sortedByPriority);
  };

  const saveNote = () => {
    if (noteText.trim().length === 0) {
      Alert.alert("Nota vacía", "Escribe algo antes de guardar.");
      return;
    }
    Alert.alert("Nota Guardada", "Tus notas de reunión han sido archivadas correctamente.");
    setNoteText(''); // Clear input
  };

  const showMemberStatus = (member) => {
    Alert.alert(
      member.name,
      `Rol: ${member.role}\nEstado: ${member.status.toUpperCase()}`,
      [{ text: "Enviar Mensaje", onPress: () => console.log("Message sent") }, { text: "OK" }]
    );
  };

  const showContactDetails = (contact) => {
    Alert.alert(
      contact.name,
      `${contact.role}\n${contact.email}`,
      [
        { text: "Copiar Email", onPress: () => Alert.alert("Copiado", "Email copiado al portapapeles") },
        { text: "Cerrar" }
      ]
    );
  };

  const addContact = () => {
    Alert.alert("Nuevo Contacto", "Funcionalidad para agregar nuevo contacto al equipo.");
  };

  // --- RENDER ITEM: Project ---
  const renderProject = ({ item }) => (
    <ScaleCard 
      style={styles.glassCard}
      onPress={() => openProject(item)}
    >
      <View style={styles.projectTop}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.daysLeft < 3 ? '#FEF2F2' : '#F0FDF4' }]}>
          <Text style={[styles.statusText, { color: item.daysLeft < 3 ? '#EF4444' : '#10B981' }]}>
            {item.daysLeft} días
          </Text>
        </View>
      </View>

      <View style={styles.projectInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>{item.client}</Text>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.footerMeta}>
          <View style={styles.avatarsRow}>
            {[1,2].map((_, i) => (
              <View key={i} style={[styles.miniAvatar, { backgroundColor: i === 0 ? '#CBD5E1' : '#94A3B8', marginLeft: i > 0 ? -8 : 0 }]} />
            ))}
          </View>
        </View>
        <ModernCircularProgress size={48} progress={item.progress} color={item.color} />
      </View>
    </ScaleCard>
  );

  return (
    <View style={styles.container}>
      {/* Ambient Background Decor */}
      <View style={[styles.ambientOrb, { top: -100, left: -50, backgroundColor: '#6366F120' }]} />
      <View style={[styles.ambientOrb, { bottom: -100, right: -50, backgroundColor: '#3B82F615' }]} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <View>
            <Text style={styles.screenTitle}>Espacio de Trabajo</Text>
            <Text style={styles.dateText}>19 Nov, Miércoles</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFocusVisible(true)}>
            <MaterialCommunityIcons name="timer-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Dashboard Highlight */}
        <Text style={styles.sectionTitle}>Proyectos Activos</Text>
        <FlatList
          data={projects}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectsList}
          renderItem={renderProject}
          keyExtractor={item => item.id}
          snapToInterval={width * 0.65 + 20}
          decelerationRate="fast"
        />

        {/* Team Availability */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Disponibilidad del Equipo</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamRow}>
          {TEAM_MEMBERS.map(member => (
            <TouchableOpacity 
              key={member.id} 
              style={styles.teamMemberContainer}
              onPress={() => showMemberStatus(member)}
            >
               <View>
                 <Image source={{ uri: member.image }} style={styles.teamAvatar} />
                 <View style={[styles.statusDot, { backgroundColor: member.status === 'online' ? '#10B981' : member.status === 'meeting' ? '#F59E0B' : '#94A3B8' }]} />
               </View>
               <Text style={styles.teamName}>{member.name}</Text>
               <Text style={styles.teamStatusText}>{member.status === 'ooo' ? 'OOO' : member.status === 'meeting' ? 'Reunión' : 'Online'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Resources */}
        <Text style={styles.sectionTitle}>Recursos Rápidos</Text>
        <View style={styles.resourcesGrid}>
          {RESOURCES.map(res => (
            <TouchableOpacity 
              key={res.id} 
              style={styles.resourceCard}
              onPress={() => openResource(res)}
            >
              <View style={[styles.resourceIcon, { backgroundColor: res.color + '15' }]}>
                <MaterialCommunityIcons name={res.icon} size={24} color={res.color} />
              </View>
              <Text style={styles.resourceText}>{res.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Task Board */}
        <View style={styles.glassSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleSmall}>Tareas Prioritarias</Text>
            <TouchableOpacity onPress={handleSortTasks}>
              <MaterialCommunityIcons name="sort" size={20} color={sortedByPriority ? THEME_COLOR : "#64748B"} />
            </TouchableOpacity>
          </View>
          
          {tasks.map((task, i) => (
            <View key={task.id} style={[styles.taskRow, i < tasks.length - 1 && styles.divider]}>
              <TouchableOpacity 
                style={[styles.checkBox, task.completed && styles.checkBoxChecked]}
                onPress={() => toggleTask(task.id)}
              >
                {task.completed && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.taskBody}
                onPress={() => toggleTask(task.id)} // Simplified interaction: tapping body also toggles or could open details
              >
                <Text style={[styles.taskText, task.completed && styles.completedText]}>{task.title}</Text>
                <View style={styles.tagsRow}>
                  <View style={[styles.priorityTag, { backgroundColor: task.priority === 'high' ? '#FEE2E2' : '#FEF3C7' }]}>
                    <Text style={[styles.priorityText, { color: task.priority === 'high' ? '#EF4444' : '#D97706' }]}>
                      {task.priority.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.categoryText}>{task.tag}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Meeting Notes */}
        <View style={styles.glassSection}>
          <Text style={styles.sectionTitleSmall}>Notas de Reunión</Text>
          <View style={styles.notesContainer}>
            <TextInput 
              placeholder="Escribe notas rápidas aquí..." 
              multiline 
              style={styles.notesInput}
              placeholderTextColor="#94A3B8"
              value={noteText}
              onChangeText={setNoteText}
            />
            <TouchableOpacity style={styles.saveNoteBtn} onPress={saveNote}>
              <MaterialCommunityIcons name="content-save-outline" size={20} color={noteText.length > 0 ? THEME_COLOR : "#64748B"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contacts Row */}
        <Text style={styles.sectionTitle}>Equipo & Contacto</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsRow}>
          <TouchableOpacity style={styles.addContactBtn} onPress={addContact}>
            <MaterialCommunityIcons name="plus" size={24} color="#64748B" />
          </TouchableOpacity>
          {CONTACTS.map(contact => (
            <TouchableOpacity 
              key={contact.id} 
              style={styles.contactPill}
              onPress={() => showContactDetails(contact)}
            >
              <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                <Text style={styles.avatarLetter}>{contact.initial}</Text>
              </View>
              <Text style={styles.contactName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Floating Focus Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setFocusVisible(true)}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="bullseye-arrow" size={28} color="#fff" />
      </TouchableOpacity>

      <FocusModal visible={focusVisible} onClose={() => setFocusVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  ambientOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 20,
    marginBottom: 16,
  },
  
  // Project Cards (Glassmorphism + Dashboard)
  projectsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  glassCard: {
    width: width * 0.65,
    backgroundColor: GLASS_BG,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  projectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 14,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    height: 28,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  projectInfo: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Task List
  glassSection: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  taskBody: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  completedText: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  categoryText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Contacts
  contactsRow: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  addContactBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  contactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 6,
    paddingRight: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME_COLOR,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  timerContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 2,
    marginTop: 4,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 20,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Team Availability
  teamRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  teamMemberContainer: {
    alignItems: 'center',
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#F8FAFC',
  },
  teamName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  teamStatusText: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Resources
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  resourceCard: {
    width: (width - 52) / 2, // 2 columns
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  // Meeting Notes
  notesContainer: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  notesInput: {
    flex: 1,
    minHeight: 80,
    padding: 12,
    fontSize: 14,
    color: '#334155',
    textAlignVertical: 'top',
  },
  saveNoteBtn: {
    padding: 10,
  },
});
