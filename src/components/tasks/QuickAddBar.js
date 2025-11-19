import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from '../shared/GlassView';
import { LifeTheme } from '../../theme/LifeTheme';
import useTaskParser from '../../hooks/useTaskParser';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const QuickAddBar = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [parsedData, setParsedData] = useState({ tags: [], date: null, priority: null });
  const { parseTaskString } = useTaskParser();

  useEffect(() => {
    const parsed = parseTaskString(text);
    // We want to show what *was* found, even if it's removed from description in the parser logic,
    // actually useTaskParser removes the tags from description.
    // But here we are just parsing the full string to see what IS in there.
    // Wait, the useTaskParser provided returns the *cleaned* description.
    // But we might want to know what tags were extracted from the CURRENT text.
    // Yes, parseTaskString returns { description (cleaned), tags, date, priority }.
    // This is perfect for the preview.
    setParsedData(parsed);
  }, [text, parseTaskString]);

  const handleFocus = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (text.length === 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsFocused(false);
    }
  };

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    
    if (onAddTask) {
      onAddTask({
        originalText: text,
        ...parsedData
      });
    }
    setText('');
    setParsedData({ tags: [], date: null, priority: null });
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFocused(false);
  };

  return (
    <View style={styles.wrapper}>
      <GlassView style={[styles.container, isFocused && styles.containerFocused]}>
        <View style={styles.inputRow}>
          <Ionicons 
            name="add-circle" 
            size={24} 
            color={LifeTheme.colors.neutralTextSecondary} 
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nueva tarea... #trabajo !alta hoy"
            placeholderTextColor={LifeTheme.colors.neutralTextSecondary}
            value={text}
            onChangeText={setText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={isFocused} // Allow multiline when focused for better experience
          />
          {isFocused && (
            <TouchableOpacity onPress={handleSubmit} style={styles.sendButton}>
              <Ionicons name="arrow-up-circle" size={32} color={LifeTheme.colors.work} />
            </TouchableOpacity>
          )}
        </View>

        {/* Preview Chips Area - Only show if focused and has content or just focused */}
        {isFocused && (
          <View style={styles.previewContainer}>
            {/* Date Chip */}
            {parsedData.date && (
              <View style={[styles.chip, { backgroundColor: LifeTheme.colors.info + '20' }]}>
                <Ionicons name="calendar-outline" size={12} color={LifeTheme.colors.info} />
                <Text style={[styles.chipText, { color: LifeTheme.colors.info }]}>
                  {parsedData.date}
                </Text>
              </View>
            )}

            {/* Priority Chip */}
            {parsedData.priority && (
              <View style={[styles.chip, { backgroundColor: LifeTheme.colors.danger + '20' }]}>
                <Ionicons name="flag-outline" size={12} color={LifeTheme.colors.danger} />
                <Text style={[styles.chipText, { color: LifeTheme.colors.danger }]}>
                  {parsedData.priority}
                </Text>
              </View>
            )}

            {/* Tags Chips */}
            {parsedData.tags.map((tag, index) => (
              <View key={index} style={[styles.chip, { backgroundColor: LifeTheme.colors.work + '20' }]}>
                <Ionicons name="pricetag-outline" size={12} color={LifeTheme.colors.work} />
                <Text style={[styles.chipText, { color: LifeTheme.colors.work }]}>
                  {tag}
                </Text>
              </View>
            ))}
            
            {/* Hint Text if nothing parsed yet */}
            {!parsedData.date && !parsedData.priority && parsedData.tags.length === 0 && text.length > 0 && (
               <Text style={styles.hintText}>Intenta: #etiqueta !prioridad fecha</Text>
            )}
          </View>
        )}
      </GlassView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: LifeTheme.spacing.m,
    paddingVertical: LifeTheme.spacing.s,
    width: '100%',
  },
  container: {
    flexDirection: 'column',
    padding: LifeTheme.spacing.s,
    borderRadius: LifeTheme.borderRadius.lg, // More rounded as per Bento
    backgroundColor: LifeTheme.glass.bg, // Ensure glass background
  },
  containerFocused: {
    padding: LifeTheme.spacing.m,
    // Elevation or shadow increase could go here
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: LifeTheme.spacing.s,
  },
  input: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }), // Use system font or custom if avail
    fontSize: 16,
    color: LifeTheme.colors.neutralText,
    minHeight: 40,
    paddingVertical: 0, // Android fix
  },
  sendButton: {
    marginLeft: LifeTheme.spacing.s,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: LifeTheme.spacing.m,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LifeTheme.borderRadius.sm,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  hintText: {
      fontSize: 12,
      color: LifeTheme.colors.neutralTextSecondary,
      fontStyle: 'italic',
      marginLeft: 4,
  }
});

export default QuickAddBar;
