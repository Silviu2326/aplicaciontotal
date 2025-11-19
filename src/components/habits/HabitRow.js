import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assuming @expo/vector-icons is available
import MiniHeatmap from './MiniHeatmap';
import { triggerImpact, triggerSuccess } from '../../utils/Haptics';

const HabitRow = ({ title, currentProgress, target, onIncrement, history = [] }) => {
  const [progress, setProgress] = useState(currentProgress);
  const completionAnim = useRef(new Animated.Value(0)).current; // 0 for not completed, 1 for completed

  useEffect(() => {
    setProgress(currentProgress);
  }, [currentProgress]);

  useEffect(() => {
    if (progress >= target) {
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      completionAnim.setValue(0); // Reset animation if progress falls below target
    }
  }, [progress, target]);

  const handleIncrement = () => {
    const newProgress = progress + 1;
    if (newProgress <= target) { // Prevent incrementing beyond target for visual consistency
      if (newProgress === target) {
        triggerSuccess();
      } else {
        triggerImpact('Light');
      }
      setProgress(newProgress);
      onIncrement(newProgress); // Notify parent component of the change
    }
  };

  const isCompleted = progress >= target;

  const rowStyles = {
    opacity: completionAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.5], // Fade out slightly when completed
    }),
    transform: [{
      scale: completionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.98], // Slightly shrink when completed
      }),
    }],
  };

  return (
    <Animated.View style={[styles.container, rowStyles]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.progressText}>
          {isCompleted ? 'Completado' : `${progress}/${target}`}
        </Text>
        <MiniHeatmap history={history} />
      </View>
      {!isCompleted && (
        <TouchableOpacity style={styles.incrementButton} onPress={handleIncrement}>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
      {isCompleted && (
        <MaterialCommunityIcons name="check-circle-outline" size={24} color="green" />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', // White background
    padding: 15,
    borderRadius: 16, // Soft rounded corners
    marginBottom: 10,
    shadowColor: '#000', // Soft shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  incrementButton: {
    backgroundColor: '#007AFF', // Blue button
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabitRow;
