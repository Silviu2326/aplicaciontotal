import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming expo icons are available
import { LifeTheme } from '../../theme/LifeTheme';
import { Subtitle } from '../../components/shared/Typography';
import { useTasks } from '../../context/TaskContext';

const { width } = Dimensions.get('window');

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds

const FocusModeScreen = ({ route, navigation }) => {
  const { taskName = "Sesión de Enfoque Profundo", taskId } = route?.params || {};
  const { dispatch } = useTasks();
  
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(true);
  const [ambientSound, setAmbientSound] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    
    if (taskId) {
        dispatch({ type: 'COMPLETE_TASK', payload: taskId });
    }

    Alert.alert(
        "¡Sesión Completada!",
        "Has mantenido tu enfoque. ¡Gran trabajo!",
        [
            { 
                text: "Continuar", 
                onPress: () => navigation.goBack() 
            }
        ]
    );
  };

  const finishSession = () => {
    Alert.alert(
        "¿Terminar sesión?",
        "Esto marcará la tarea como completada.",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Terminar", 
                style: "destructive", 
                onPress: handleSessionComplete 
            }
        ]
    );
  };

  const toggleAmbientSound = () => {
    setAmbientSound(!ambientSound);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progress = timeLeft / FOCUS_TIME;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header / Back Button (Optional but good for UX) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={LifeTheme.colors.neutralTextSecondary} />
        </TouchableOpacity>
        <Subtitle style={styles.headerTitle}>Focus Mode</Subtitle>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.contentContainer}>
        {/* Task Display */}
        <View style={styles.taskContainer}>
            <Text style={styles.focusLabel}>AHORA:</Text>
            <Text style={styles.taskText} numberOfLines={3}>
                {taskName}
            </Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
            <View style={[styles.timerCircle, { borderColor: isActive ? LifeTheme.colors.study : LifeTheme.colors.neutralTextSecondary }]}>
                 <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                 <Text style={styles.timerSubtext}>{isActive ? 'ENFOCADO' : 'PAUSADO'}</Text>
            </View>
        </View>

        {/* Ambient Sound Toggle */}
        <TouchableOpacity 
            style={[
                styles.ambientButton, 
                ambientSound && styles.ambientButtonActive
            ]}
            onPress={toggleAmbientSound}
        >
            <Ionicons 
                name={ambientSound ? "volume-high" : "volume-mute"} 
                size={24} 
                color={ambientSound ? LifeTheme.colors.white : LifeTheme.colors.neutralTextSecondary} 
            />
            <Text style={[
                styles.ambientText, 
                ambientSound && styles.ambientTextActive
            ]}>
                Sonido Ambiente {ambientSound ? 'ON' : 'OFF'}
            </Text>
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
            style={[styles.button, styles.pauseButton]} 
            onPress={toggleTimer}
        >
            <Ionicons name={isActive ? "pause" : "play"} size={24} color={LifeTheme.colors.neutralText} />
            <Text style={styles.buttonText}>{isActive ? "Pausar" : "Reanudar"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.button, styles.finishButton]} 
            onPress={finishSession}
        >
             <Ionicons name="stop" size={24} color={LifeTheme.colors.white} />
            <Text style={[styles.buttonText, { color: LifeTheme.colors.white }]}>Terminar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LifeTheme.colors.neutralBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LifeTheme.spacing.m,
    paddingTop: LifeTheme.spacing.s,
  },
  closeButton: {
      padding: LifeTheme.spacing.s,
  },
  headerTitle: {
      marginBottom: 0,
      fontSize: 16,
  },
  contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: LifeTheme.spacing.l,
  },
  taskContainer: {
      marginBottom: LifeTheme.spacing.xxl,
      alignItems: 'center',
  },
  focusLabel: {
      fontSize: 14,
      color: LifeTheme.colors.neutralTextSecondary,
      fontWeight: '600',
      marginBottom: LifeTheme.spacing.xs,
      letterSpacing: 1.5,
  },
  taskText: {
      fontSize: 32, // Giant text
      fontWeight: 'bold',
      color: LifeTheme.colors.neutralText,
      textAlign: 'center',
      lineHeight: 40,
  },
  timerContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: LifeTheme.spacing.xxl,
  },
  timerCircle: {
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: (width * 0.7) / 2,
      borderWidth: 4,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.5)', // Subtle glass fill
      shadowColor: LifeTheme.shadows.soft.shadowColor,
      shadowOffset: LifeTheme.shadows.soft.shadowOffset,
      shadowOpacity: LifeTheme.shadows.soft.shadowOpacity,
      shadowRadius: LifeTheme.shadows.soft.shadowRadius,
      elevation: 4,
  },
  timerText: {
      fontSize: 64,
      fontWeight: '200',
      color: LifeTheme.colors.neutralText,
      fontVariant: ['tabular-nums'],
  },
  timerSubtext: {
      fontSize: 16,
      color: LifeTheme.colors.neutralTextSecondary,
      marginTop: LifeTheme.spacing.s,
      letterSpacing: 2,
  },
  ambientButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: LifeTheme.spacing.s,
      paddingHorizontal: LifeTheme.spacing.m,
      borderRadius: LifeTheme.borderRadius.full,
      backgroundColor: 'rgba(0,0,0,0.05)',
  },
  ambientButtonActive: {
      backgroundColor: LifeTheme.colors.study, // Orange for focus/study
  },
  ambientText: {
      marginLeft: LifeTheme.spacing.s,
      color: LifeTheme.colors.neutralTextSecondary,
      fontWeight: '600',
  },
  ambientTextActive: {
      color: LifeTheme.colors.white,
  },
  controlsContainer: {
      paddingHorizontal: LifeTheme.spacing.l,
      paddingBottom: LifeTheme.spacing.xl,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: LifeTheme.spacing.m,
  },
  button: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: LifeTheme.spacing.m,
      borderRadius: LifeTheme.borderRadius.md,
      ...LifeTheme.shadows.soft,
  },
  pauseButton: {
      backgroundColor: LifeTheme.colors.white,
  },
  finishButton: {
      backgroundColor: LifeTheme.colors.danger,
  },
  buttonText: {
      marginLeft: LifeTheme.spacing.s,
      fontSize: 16,
      fontWeight: '600',
      color: LifeTheme.colors.neutralText,
  }
});

export default FocusModeScreen;
