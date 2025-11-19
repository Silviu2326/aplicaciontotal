import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LifeTheme } from '../../theme/LifeTheme';

export const Title = ({ children, style, ...props }) => (
  <Text style={[styles.title, style]} {...props}>
    {children}
  </Text>
);

export const Subtitle = ({ children, style, ...props }) => (
  <Text style={[styles.subtitle, style]} {...props}>
    {children}
  </Text>
);

export const Body = ({ children, style, ...props }) => (
  <Text style={[styles.body, style]} {...props}>
    {children}
  </Text>
);

const styles = StyleSheet.create({
  title: {
    ...LifeTheme.typography.title,
    marginBottom: LifeTheme.spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LifeTheme.colors.neutralTextSecondary,
    marginBottom: LifeTheme.spacing.s,
  },
  body: {
    ...LifeTheme.typography.body,
    lineHeight: 24,
  },
});
