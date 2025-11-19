import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LifeTheme } from '../../theme/LifeTheme';
import GlassView from '../shared/GlassView';
import { useTasks } from '../../context/TaskContext';
import { Calendar, LocaleConfig } from 'react-native-calendars';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Configure Spanish Locale for Calendar
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

const TaskInboxDrawer = ({ isVisible, onClose }) => {
  const { state, dispatch } = useTasks();
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showCalendarForId, setShowCalendarForId] = useState(null);

  // Filter tasks that are active and have NO due_date (or empty string)
  const inboxTasks = state.tasks.filter(task => 
    task.status !== 'completed' && 
    task.status !== 'cancelled' && 
    (!task.due_date || task.due_date === '')
  );

  const handleSchedule = (taskId, date) => {
    // date should be a Date object or ISO string
    const isoDate = typeof date === 'string' ? date : date.toISOString();
    
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: { due_date: isoDate }
      }
    });

    // Collapse and clear selection
    if (expandedTaskId === taskId) setExpandedTaskId(null);
    if (showCalendarForId === taskId) setShowCalendarForId(null);
  };

  const toggleExpand = (taskId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      setShowCalendarForId(null);
    } else {
      setExpandedTaskId(taskId);
      setShowCalendarForId(null);
    }
  };

  const toggleCalendar = (taskId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (showCalendarForId === taskId) {
      setShowCalendarForId(null);
    } else {
      setShowCalendarForId(taskId);
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedTaskId === item.id;
    const isCalendarVisible = showCalendarForId === item.id;

    return (
      <GlassView style={styles.taskItem}>
        <TouchableOpacity 
          style={styles.taskHeader} 
          onPress={() => toggleExpand(item.id)}
        >
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            {item.notes ? (
              <Text style={styles.taskNotes} numberOfLines={1}>{item.notes}</Text>
            ) : null}
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={LifeTheme.colors.neutralTextSecondary} 
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionLabel}>Programar para:</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: LifeTheme.colors.info + '20' }]}
                onPress={() => {
                    const today = new Date();
                    handleSchedule(item.id, today);
                }}
              >
                <Text style={[styles.actionButtonText, { color: LifeTheme.colors.info }]}>Hoy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: LifeTheme.colors.success + '20' }]}
                onPress={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    handleSchedule(item.id, tomorrow);
                }}
              >
                <Text style={[styles.actionButtonText, { color: LifeTheme.colors.success }]}>Mañana</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: LifeTheme.colors.warning + '20' }]}
                onPress={() => toggleCalendar(item.id)}
              >
                <Ionicons name="calendar" size={16} color={LifeTheme.colors.warning} />
              </TouchableOpacity>
            </View>

            {isCalendarVisible && (
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={day => {
                    // day is object { dateString: '2022-01-01', ... }
                    // We need ISO string. The calendar returns YYYY-MM-DD.
                    // We can just append T00:00:00.000Z or use standard Date parsing
                    const dateStr = new Date(day.dateString).toISOString();
                    handleSchedule(item.id, dateStr);
                  }}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: LifeTheme.colors.neutralTextSecondary,
                    selectedDayBackgroundColor: LifeTheme.colors.work,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: LifeTheme.colors.work,
                    dayTextColor: LifeTheme.colors.neutralText,
                    textDisabledColor: '#d9e1e8',
                    arrowColor: LifeTheme.colors.work,
                    monthTextColor: LifeTheme.colors.neutralText,
                    indicatorColor: LifeTheme.colors.work,
                  }}
                />
              </View>
            )}
          </View>
        )}
      </GlassView>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.drawerContent}>
          <View style={styles.handleBar} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Inbox ({inboxTasks.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={LifeTheme.colors.neutralText} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Tareas sin fecha asignada. Toca para programar.
          </Text>

          {inboxTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={LifeTheme.colors.success} />
              <Text style={styles.emptyText}>¡Inbox vacío! Todo está organizado.</Text>
            </View>
          ) : (
            <FlatList
              data={inboxTasks}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)', // Dimmed background
  },
  dismissArea: {
    flex: 1,
  },
  drawerContent: {
    backgroundColor: LifeTheme.colors.neutralBg,
    borderTopLeftRadius: LifeTheme.borderRadius.lg,
    borderTopRightRadius: LifeTheme.borderRadius.lg,
    padding: LifeTheme.spacing.m,
    height: '75%', // Take up 3/4 of screen
    ...LifeTheme.shadows.deep,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LifeTheme.colors.neutralTextSecondary + '40',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: LifeTheme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LifeTheme.spacing.s,
  },
  title: {
    ...LifeTheme.typography.title,
    fontSize: 20,
  },
  subtitle: {
    ...LifeTheme.typography.caption,
    marginBottom: LifeTheme.spacing.m,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: LifeTheme.spacing.xxl,
  },
  taskItem: {
    marginBottom: LifeTheme.spacing.s,
    padding: LifeTheme.spacing.m,
    backgroundColor: LifeTheme.colors.white,
    borderRadius: LifeTheme.borderRadius.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    marginRight: LifeTheme.spacing.s,
  },
  taskTitle: {
    ...LifeTheme.typography.body,
    fontWeight: '600',
  },
  taskNotes: {
    ...LifeTheme.typography.caption,
    marginTop: 2,
  },
  actionContainer: {
    marginTop: LifeTheme.spacing.m,
    paddingTop: LifeTheme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: LifeTheme.colors.neutralTextSecondary + '20',
  },
  actionLabel: {
    ...LifeTheme.typography.caption,
    marginBottom: LifeTheme.spacing.s,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: LifeTheme.spacing.s,
  },
  actionButton: {
    paddingHorizontal: LifeTheme.spacing.m,
    paddingVertical: LifeTheme.spacing.s,
    borderRadius: LifeTheme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  calendarContainer: {
    marginTop: LifeTheme.spacing.m,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: LifeTheme.borderRadius.md,
    overflow: 'hidden',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: LifeTheme.spacing.xl,
  },
  emptyText: {
    ...LifeTheme.typography.body,
    color: LifeTheme.colors.neutralTextSecondary,
    marginTop: LifeTheme.spacing.s,
  },
});

export default TaskInboxDrawer;
