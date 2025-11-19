import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { LifeTheme } from '../../theme/LifeTheme';
import GlassView from '../shared/GlassView';
import { Title, Body } from '../shared/Typography';
import { findBestSlot } from '../../utils/aiScheduler';
import { triggerSuccess } from '../../utils/Haptics';

const QuickEventModal = ({ visible, onClose, onSave, events = [] }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30); // Default 30 minutes

  const handleAutoSchedule = () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Por favor, ingresa un título para el evento.');
      return;
    }

    const bestStartTime = findBestSlot(duration, events);

    if (bestStartTime) {
      const endTime = new Date(bestStartTime.getTime() + duration * 60000);
      
      const newEvent = {
        title: title.trim(),
        start: bestStartTime,
        end: endTime,
        // Add other default properties as needed
      };

      triggerSuccess(); // Haptic feedback for success
      onSave(newEvent);
      resetForm();
    } else {
      Alert.alert('Sin huecos', 'No pudimos encontrar un hueco libre para esta duración hoy.');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDuration(30);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <GlassView style={styles.container} intensity={0.95}>
          <Title style={styles.modalTitle}>Nuevo Evento Rápido</Title>
          
          <TextInput
            style={styles.input}
            placeholder="Título del evento"
            placeholderTextColor={LifeTheme.colors.neutralTextSecondary}
            value={title}
            onChangeText={setTitle}
            autoFocus={true}
          />

          <Body style={styles.label}>Duración:</Body>
          <View style={styles.durationContainer}>
            {[15, 30, 60].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.durationButton,
                  duration === m && styles.durationButtonActive
                ]}
                onPress={() => setDuration(m)}
              >
                <Text style={[
                  styles.durationText,
                  duration === m && styles.durationTextActive
                ]}>
                  {m === 60 ? '1h' : `${m}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAutoSchedule} style={styles.autoButton}>
              <Text style={styles.autoButtonText}>✨ Auto-Agendar</Text>
            </TouchableOpacity>
          </View>
        </GlassView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    padding: LifeTheme.spacing.m,
  },
  container: {
    padding: LifeTheme.spacing.l,
    borderRadius: LifeTheme.borderRadius.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: LifeTheme.spacing.l,
  },
  input: {
    backgroundColor: LifeTheme.colors.white,
    borderRadius: LifeTheme.borderRadius.md,
    padding: LifeTheme.spacing.m,
    fontSize: 16,
    color: LifeTheme.colors.neutralText,
    marginBottom: LifeTheme.spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  label: {
    marginBottom: LifeTheme.spacing.s,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LifeTheme.spacing.xl,
  },
  durationButton: {
    flex: 1,
    paddingVertical: LifeTheme.spacing.s,
    paddingHorizontal: LifeTheme.spacing.s,
    borderRadius: LifeTheme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationButtonActive: {
    backgroundColor: LifeTheme.colors.work,
    borderColor: LifeTheme.colors.work,
  },
  durationText: {
    fontSize: 14,
    color: LifeTheme.colors.neutralText,
    fontWeight: '600',
  },
  durationTextActive: {
    color: LifeTheme.colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    padding: LifeTheme.spacing.m,
  },
  cancelButtonText: {
    color: LifeTheme.colors.neutralTextSecondary,
    fontSize: 16,
  },
  autoButton: {
    backgroundColor: LifeTheme.colors.neutralText,
    paddingVertical: LifeTheme.spacing.m,
    paddingHorizontal: LifeTheme.spacing.l,
    borderRadius: LifeTheme.borderRadius.full,
    shadowColor: LifeTheme.shadows.soft.shadowColor,
    shadowOffset: LifeTheme.shadows.soft.shadowOffset,
    shadowOpacity: LifeTheme.shadows.soft.shadowOpacity,
    shadowRadius: LifeTheme.shadows.soft.shadowRadius,
    elevation: LifeTheme.shadows.soft.elevation,
  },
  autoButtonText: {
    color: LifeTheme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuickEventModal;
