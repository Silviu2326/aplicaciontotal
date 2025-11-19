import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

export const triggerSuccess = async () => {
  if (!isWeb) {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('[Haptics] Error triggering success haptic', error);
    }
  } else {
    console.log('[Haptics] Success triggered (Mock)');
  }
};

export const triggerImpact = async (style = 'Medium') => {
  if (!isWeb) {
    try {
      let impactStyle;
      switch (style) {
        case 'Light':
          impactStyle = Haptics.ImpactFeedbackStyle.Light;
          break;
        case 'Heavy':
          impactStyle = Haptics.ImpactFeedbackStyle.Heavy;
          break;
        case 'Medium':
        default:
          impactStyle = Haptics.ImpactFeedbackStyle.Medium;
          break;
      }
      await Haptics.impactAsync(impactStyle);
    } catch (error) {
      console.log('[Haptics] Error triggering impact haptic', error);
    }
  } else {
    console.log(`[Haptics] Impact triggered: ${style} (Mock)`);
  }
};

export const triggerSelection = async () => {
  if (!isWeb) {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('[Haptics] Error triggering selection haptic', error);
    }
  } else {
    console.log('[Haptics] Selection triggered (Mock)');
  }
};