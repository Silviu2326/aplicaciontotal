import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MiniPlayer({ data }) {
  const { title, artist, cover, progress } = data;

  return (
    <View style={styles.container}>
      <View style={styles.player}>
        <View style={styles.artwork}>
             <Ionicons name="musical-notes" size={24} color="#fff" />
        </View>
        
        <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.artist}>{artist}</Text>
        </View>

        <View style={styles.controls}>
            <TouchableOpacity>
                <Ionicons name="play-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playBtn}>
                <Ionicons name="pause" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="play-forward" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* Progress Bar Overlay at bottom */}
        <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  player: {
    backgroundColor: '#1A1A1A', // Almost black
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 2,
  },
  artist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB', // Accent color
  }
});
