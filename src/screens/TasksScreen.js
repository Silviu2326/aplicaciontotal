import React, { useContext, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  StyleSheet, 
  StatusBar,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values';

import TaskContext from '../context/TaskContext';
import useTaskFilters from '../hooks/useTaskFilters';

import QuickAddBar from '../components/tasks/QuickAddBar';
import FilterBar from '../components/tasks/FilterBar';
import TaskCard from '../components/tasks/TaskCard';
import RescheduleModal from '../components/tasks/RescheduleModal';
import GlassView from '../components/shared/GlassView';
import HabitRow from '../components/habits/HabitRow';
import { LifeTheme } from '../theme/LifeTheme';

// --- CONSTANTS ---
const FILTERS = ['Todos', 'Hoy', 'Próximas', 'Alta Energía', 'Trabajo'];

const MAP_FILTERS = {
  'Todos': null,
  'Hoy': { time: 'today' },
  'Próximas': { time: 'upcoming' },
  'Alta Energía': { energy: 'high' },
  'Trabajo': { context: 'work' } // Assuming 'work' tag/context
};

export default function TasksScreen() {
  const navigation = useNavigation();
  const { state, dispatch } = useContext(TaskContext);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'habits'

  // --- DATA MAPPING ---
  // Transform Reducer Schema (snake_case, p1/p2) to UI Schema (camelCase, high/medium)
  // expected by useTaskFilters and TaskCard
  const mappedTasks = useMemo(() => {
    return state.tasks.map(t => {
      let uiPriority = 'low';
      if (t.priority === 'p1') uiPriority = 'high';
      else if (t.priority === 'p2') uiPriority = 'medium';
      else if (t.priority === 'p3') uiPriority = 'low';

      let uiEnergy = t.energy_level || 'medium';

      // Ensure status maps to what useTaskFilters expects ('pending', 'completed')
      // Reducer uses 'active', 'completed'
      let uiStatus = t.status === 'active' ? 'pending' : t.status;

      return {
        ...t,
        id: t.id,
        title: t.title,
        subtitle: t.context_tags ? t.context_tags.join(', ') : '', // Subtitle from tags
        isCompleted: t.status === 'completed',
        dueDate: t.due_date ? t.due_date.split('T')[0] : null, // Extract YYYY-MM-DD for hook
        fullDueDate: t.due_date, // Keep full for other uses if needed
        priority: uiPriority,
        energy: uiEnergy,
        status: uiStatus,
        // Helper for context filter in hook
        context: t.context_tags.includes('work') ? 'work' : t.context_tags.includes('personal') ? 'personal' : 'other' 
      };
    });
  }, [state.tasks]);

  const habits = state.habits || [];

  const totalStreak = useMemo(() => {
    return habits.reduce((acc, habit) => acc + (habit.streak || 0), 0);
  }, [habits]);

  // --- FILTERING ---
  const filterConfig = MAP_FILTERS[activeFilter];
  const filteredTasks = useTaskFilters(mappedTasks, filterConfig);

  // --- HANDLERS ---

  const handleAddTask = ({ originalText, tags, date, priority }) => {
    // Map UI priority input to Reducer priority
    let dbPriority = 'none';
    if (priority === 'high') dbPriority = 'p1';
    if (priority === 'medium') dbPriority = 'p2';
    if (priority === 'low') dbPriority = 'p3';

    const newTaskPayload = {
      id: uuidv4(),
      title: originalText, // Ideally we'd use a cleaned description here
      status: 'active',
      priority: dbPriority,
      energy_level: 'medium', // Default
      due_date: date ? new Date(date).toISOString() : new Date().toISOString(),
      context_tags: tags
    };

    dispatch({ type: 'ADD_TASK', payload: newTaskPayload });
  };

  const handleToggleTask = (task) => {
    if (task.isCompleted) {
        // If already completed, reactivating it?
        // The reducer doesn't have 'UNCOMPLETE'. We can use UPDATE_TASK.
        dispatch({ 
            type: 'UPDATE_TASK', 
            payload: { id: task.id, updates: { status: 'active', completed_at: null } } 
        });
    } else {
        dispatch({ type: 'COMPLETE_TASK', payload: task.id });
    }
  };

  const handleDeleteTask = (taskId) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const handleOpenTask = (task) => {
    // Navigate to detail or show modal (Future step)
    console.log('Open task:', task.title);
  };
  
  const handleStartFocus = () => {
    navigation.navigate('FocusMode');
  };

  const handleIncrementHabit = (habitId) => {
    dispatch({ type: 'INCREMENT_HABIT', payload: habitId });
  };

  // --- RENDER ---

  const renderTaskItem = ({ item }) => (
    <TaskCard
      task={item}
      onToggle={() => handleToggleTask(item)}
      onPress={() => handleOpenTask(item)}
      onComplete={() => dispatch({ type: 'COMPLETE_TASK', payload: item.id })}
      onDelete={() => handleDeleteTask(item.id)}
    />
  );

  const renderHabitItem = ({ item }) => (
    <HabitRow
      title={item.title}
      currentProgress={item.currentProgress}
      target={item.target}
      onIncrement={() => handleIncrementHabit(item.id)}
      history={item.history}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
        <GlassView style={styles.emptyGlass}>
            <Ionicons name="sparkles-outline" size={48} color={LifeTheme.colors.neutralTextSecondary} />
            <Text style={styles.emptyText}>Todo limpio por aquí</Text>
            <Text style={styles.emptySubtext}>
                {activeFilter === 'Todos' 
                    ? "¡Gran trabajo! No hay tareas pendientes." 
                    : "No hay tareas que coincidan con este filtro."}
            </Text>
        </GlassView>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
        onPress={() => setActiveTab('tasks')}
      >
        <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>Tareas</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'habits' && styles.tabButtonActive]}
        onPress={() => setActiveTab('habits')}
      >
        <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>Hábitos</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderFocusButton = () => (
    <TouchableOpacity 
      style={styles.focusButtonContainer} 
      onPress={handleStartFocus}
      activeOpacity={0.8}
    >
      <GlassView style={styles.focusButtonGlass}>
        <View style={styles.focusContent}>
          <View style={styles.focusIconContainer}>
             <Ionicons name="play" size={20} color={LifeTheme.colors.white} />
          </View>
          <View style={styles.focusTextContainer}>
             <Text style={styles.focusTitle}>Modo Focus</Text>
             <Text style={styles.focusSubtitle}>Entra en la zona (25 min)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={LifeTheme.colors.neutralTextSecondary} />
        </View>
      </GlassView>
    </TouchableOpacity>
  );

  const renderHabitsView = () => (
    <View style={styles.habitsContainer}>
      <GlassView style={styles.streakSummary}>
        <Text style={styles.streakLabel}>Racha Total</Text>
        <View style={styles.streakValueContainer}>
          <Ionicons name="flame" size={28} color={LifeTheme.colors.accentOrange} />
          <Text style={styles.streakValue}>{totalStreak}</Text>
        </View>
        <Text style={styles.streakSubtext}>días acumulados</Text>
      </GlassView>
      
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        renderItem={renderHabitItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={LifeTheme.colors.neutralBg} />
      <RescheduleModal />
      
      <View style={styles.header}>
        <QuickAddBar onAddTask={handleAddTask} />
      </View>

      {renderTabs()}

      {activeTab === 'tasks' ? (
        <>
          <View style={styles.filters}>
            <FilterBar 
              filters={FILTERS} 
              activeFilter={activeFilter} 
              onSelectFilter={setActiveFilter} 
            />
          </View>
          
          <View style={styles.focusSection}>
            {renderFocusButton()}
          </View>

          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        renderHabitsView()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LifeTheme.colors.neutralBg,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    paddingTop: LifeTheme.spacing.s,
    paddingBottom: LifeTheme.spacing.xs,
    zIndex: 10, // Ensure QuickAddBar dropdown/shadows show above list if needed
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: LifeTheme.spacing.m,
    marginBottom: LifeTheme.spacing.s,
  },
  tabButton: {
    paddingVertical: LifeTheme.spacing.s,
    paddingHorizontal: LifeTheme.spacing.l,
    borderRadius: LifeTheme.borderRadius.m,
    marginRight: LifeTheme.spacing.s,
  },
  tabButtonActive: {
    backgroundColor: LifeTheme.colors.primary,
  },
  tabText: {
    ...LifeTheme.typography.bodyBold,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  tabTextActive: {
    color: LifeTheme.colors.neutralTextLight,
  },
  filters: {
    paddingBottom: LifeTheme.spacing.s,
  },
  focusSection: {
    paddingHorizontal: LifeTheme.spacing.m,
    marginBottom: LifeTheme.spacing.m,
  },
  focusButtonContainer: {
    borderRadius: LifeTheme.borderRadius.lg,
    ...LifeTheme.shadows.soft,
  },
  focusButtonGlass: {
    padding: LifeTheme.spacing.m,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly more opaque
  },
  focusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LifeTheme.colors.study,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LifeTheme.spacing.m,
  },
  focusTextContainer: {
    flex: 1,
  },
  focusTitle: {
    ...LifeTheme.typography.bodyBold,
    fontSize: 16,
    color: LifeTheme.colors.neutralText,
  },
  focusSubtitle: {
    ...LifeTheme.typography.caption,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  listContent: {
    paddingHorizontal: LifeTheme.spacing.m,
    paddingBottom: 100, // Space for FAB or bottom nav
  },
  habitsContainer: {
    flex: 1,
  },
  streakSummary: {
    marginHorizontal: LifeTheme.spacing.m,
    marginBottom: LifeTheme.spacing.m,
    padding: LifeTheme.spacing.m,
    alignItems: 'center',
  },
  streakLabel: {
    ...LifeTheme.typography.caption,
    color: LifeTheme.colors.neutralTextSecondary,
    marginBottom: 4,
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakValue: {
    ...LifeTheme.typography.display,
    fontSize: 32,
    marginLeft: 8,
    color: LifeTheme.colors.neutralText,
  },
  streakSubtext: {
    ...LifeTheme.typography.caption,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: LifeTheme.spacing.l,
  },
  emptyGlass: {
      alignItems: 'center',
      padding: LifeTheme.spacing.xl,
      borderRadius: LifeTheme.borderRadius.lg,
  },
  emptyText: {
    ...LifeTheme.typography.title,
    fontSize: 20,
    marginTop: LifeTheme.spacing.m,
    textAlign: 'center',
  },
  emptySubtext: {
      ...LifeTheme.typography.caption,
      fontSize: 14,
      marginTop: LifeTheme.spacing.s,
      textAlign: 'center',
      maxWidth: 250,
  }
});