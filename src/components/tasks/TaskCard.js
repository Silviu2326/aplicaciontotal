import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import GlassView from '../shared/GlassView';
import PriorityTag from '../shared/PriorityTag';
import EnergyTag from '../shared/EnergyTag';
import { LifeTheme } from '../../theme/LifeTheme';
import { triggerSuccess, triggerImpact } from '../../utils/Haptics';

const TaskCard = ({ task, onToggle, onPress, onComplete, onDelete, style }) => {
  const { title, subtitle, isCompleted, priority, energy, dueDate, isOverdue: propIsOverdue } = task;

  // Determine if overdue either from prop or naive date check if needed. 
  // Assuming the parent might calculate it, but as a fallback/visual logic:
  const isOverdue = propIsOverdue || (dueDate && new Date(dueDate) < new Date() && !isCompleted);

  // Animation for checkbox
  const scaleAnim = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isCompleted ? 1 : 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();
  }, [isCompleted]);

  const handleToggle = () => {
    if (!isCompleted) {
        triggerSuccess();
    } else {
        triggerImpact('Light');
    }
    onToggle();
  };

  const handleComplete = () => {
    triggerSuccess();
    onComplete();
  };

  const handleDelete = () => {
    triggerImpact('Medium');
    onDelete();
  };

  const renderLeftActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.leftAction} onPress={handleComplete}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          <Ionicons name="checkmark" size={24} color="white" />
        </Animated.Text>
      </RectButton>
    );
  };

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <RectButton style={styles.rightAction} onPress={handleDelete}>
        <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
          <Ionicons name="trash" size={24} color="white" />
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={handleComplete} // Optional: trigger on full swipe
      onSwipeableRightOpen={handleDelete} // Optional: trigger on full swipe
    >
      <Pressable onPress={onPress}>
        <GlassView style={[styles.container, style]}>
          {/* Checkbox Section */}
          <TouchableOpacity 
            style={[
              styles.checkboxBase, 
              isCompleted && styles.checkboxChecked,
              isOverdue && !isCompleted && styles.checkboxOverdue
            ]} 
            onPress={handleToggle}
            activeOpacity={0.7}
          >
            {isCompleted && (
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.title, 
                isCompleted && styles.titleCompleted,
                isOverdue && !isCompleted && styles.titleOverdue
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Badges Section */}
          <View style={styles.badgesContainer}>
            {priority && <PriorityTag priority={priority} style={styles.badge} />}
            {energy && <EnergyTag energy={energy} style={styles.badge} />}
          </View>
        </GlassView>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LifeTheme.spacing.m,
    marginBottom: LifeTheme.spacing.s,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    borderRadius: LifeTheme.borderRadius.full,
    borderWidth: 2,
    borderColor: LifeTheme.colors.neutralTextSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: LifeTheme.spacing.m,
  },
  checkboxChecked: {
    backgroundColor: LifeTheme.colors.success,
    borderColor: LifeTheme.colors.success,
  },
  checkboxOverdue: {
    borderColor: LifeTheme.colors.danger,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: LifeTheme.colors.neutralText,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: LifeTheme.colors.neutralTextSecondary,
  },
  titleOverdue: {
    color: LifeTheme.colors.danger,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 12,
    color: LifeTheme.colors.neutralTextSecondary,
  },
  badgesContainer: {
    flexDirection: 'column', // Stack vertically to save horizontal space or match design
    alignItems: 'flex-end',
    marginLeft: LifeTheme.spacing.s,
    gap: 4, // Gap support depends on RN version, safe to use margin in child if needed, but gap is supported in newer RN.
  },
  badge: {
    marginBottom: 4,
  },
  leftAction: {
    backgroundColor: LifeTheme.colors.success,
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingRight: LifeTheme.spacing.m,
    borderRadius: LifeTheme.borderRadius.card,
    marginBottom: LifeTheme.spacing.s, // Match container's marginBottom
  },
  rightAction: {
    backgroundColor: LifeTheme.colors.danger,
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
    paddingLeft: LifeTheme.spacing.m,
    borderRadius: LifeTheme.borderRadius.card,
    marginBottom: LifeTheme.spacing.s, // Match container's marginBottom
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default TaskCard;
