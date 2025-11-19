import React from 'react';
import { View, StyleSheet } from 'react-native';

const GlassView = ({ children, style, intensity = 0.1 }) => {
  // Base styles for the glassmorphism effect, derived from GEMINI.md
  const glassStyles = {
    backgroundColor: `rgba(248, 250, 252, ${intensity})`, // #F8FAFC with adjustable opacity
    borderRadius: 16, // Border Radius 16-24px from GEMINI.md
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle white border
    shadowColor: '#000', // Soft Shadows from GEMINI.md
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  };

  return (
    <View style={[styles.container, glassStyles, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default GlassView;
