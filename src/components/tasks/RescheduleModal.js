import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../context/TaskContext';
import { LifeTheme } from '../../theme/LifeTheme';
import GlassView from '../shared/GlassView';

const { colors, spacing, shadows } = LifeTheme;

const RescheduleModal = () => {
  const { state, dispatch } = useTasks();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Detect overdue tasks (from yesterday or earlier)
  const overdueTasks = useMemo(() => {
    if (!state.tasks) return [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return state.tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled' || task.status === 'migrated') return false;
      if (!task.due_date) return false;
      
      const dueDate = new Date(task.due_date);
      // Check if strictly before today (dueDate < todayStart)
      return dueDate < todayStart;
    });
  }, [state.tasks]);

  useEffect(() => {
    if (overdueTasks.length > 0 && !dismissed) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [overdueTasks.length, dismissed]);

  const handleClose = () => {
    setDismissed(true);
    setVisible(false);
  };

  const moveAllToToday = () => {
    const taskIds = overdueTasks.map(t => t.id);
    const today = new Date().toISOString();
    dispatch({
      type: 'MIGRATE_TASKS',
      payload: { taskIds, targetDate: today }
    });
  };

  const moveToWeekend = () => {
    const taskIds = overdueTasks.map(t => t.id);
    const today = new Date();
    const nextSaturday = new Date(today);
    const daysUntilSat = 6 - today.getDay(); // 6 is Saturday
    let daysToAdd = daysUntilSat;
    if (daysUntilSat <= 0) daysToAdd += 7; // If today is Sat, move to next Sat
    
    nextSaturday.setDate(today.getDate() + daysToAdd);
    
    dispatch({
      type: 'MIGRATE_TASKS',
      payload: { taskIds, targetDate: nextSaturday.toISOString() }
    });
  };

  const deleteNonEssential = () => {
    // Keep 'p1' (High Priority), delete others
    const nonEssentialTasks = overdueTasks.filter(t => t.priority !== 'p1');
    const idsToDelete = nonEssentialTasks.map(t => t.id);

    if (idsToDelete.length > 0) {
      dispatch({
        type: 'DELETE_TASKS',
        payload: idsToDelete
      });
    }
  };

  if (!visible || overdueTasks.length === 0) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <GlassView style={styles.modalView} intensity={0.95}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={32} color={colors.warning} />
            </View>
            <View style={styles.headerText}>
                <Text style={styles.modalTitle}>Tareas Vencidas</Text>
                <Text style={styles.modalSubtitle}>
                    Tienes {overdueTasks.length} tareas pendientes de ayer.
                </Text>
            </View>
          </View>

          <View style={styles.listContainer}>
            <ScrollView style={styles.taskList} contentContainerStyle={{paddingVertical: 8}}>
                {overdueTasks.map(task => (
                <View key={task.id} style={styles.taskItem}>
                    <View style={[
                        styles.priorityDot, 
                        { backgroundColor: task.priority === 'p1' ? colors.danger : colors.neutralTextSecondary }
                    ]} />
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Text style={styles.taskDate}>
                        {new Date(task.due_date).toLocaleDateString()}
                    </Text>
                </View>
                ))}
            </ScrollView>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={moveAllToToday}>
                <Text style={[styles.buttonText, styles.textPrimary]}>Mover todo a Hoy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={moveToWeekend}>
                <Text style={[styles.buttonText, styles.textSecondary]}>Mover al Finde</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, styles.buttonDestructive]} onPress={deleteNonEssential}>
                <Text style={[styles.buttonText, styles.textDestructive]}>Eliminar no esencial</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>Decidir más tarde</Text>
          </TouchableOpacity>
        </GlassView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.l,
  },
  modalView: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: spacing.l,
    ...shadows.deep,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // Warning with opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  headerText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutralText,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.neutralTextSecondary,
    marginTop: 2,
  },
  listContainer: {
    maxHeight: 200,
    marginBottom: spacing.l,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: spacing.s,
  },
  taskList: {
    width: '100%',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.s,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: colors.neutralText,
    marginRight: spacing.s,
  },
  taskDate: {
    fontSize: 12,
    color: colors.danger,
  },
  actionButtons: {
    gap: spacing.s,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.neutralText, // Black/Dark
  },
  buttonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutralTextSecondary,
  },
  buttonDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red with opacity
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  textPrimary: {
    color: colors.white,
  },
  textSecondary: {
    color: colors.neutralText,
  },
  textDestructive: {
    color: colors.danger,
  },
  closeButton: {
    marginTop: spacing.m,
    alignItems: 'center',
  },
  closeText: {
    color: colors.neutralTextSecondary,
    fontSize: 14,
  },
});

export default RescheduleModal;
