import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COUNT = 30;
const CONFETTI_COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6', '#F97316'];

interface ConfettiPieceProps {
  delay: number;
  color: string;
  startX: number;
}

function ConfettiPiece({ delay, color, startX }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(SCREEN_HEIGHT + 20, { duration: 2000 }));
    translateX.value = withDelay(delay, withTiming(startX + (Math.random() - 0.5) * 100, { duration: 2000 }));
    rotate.value = withDelay(delay, withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 2000 }));
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

interface Props {
  visible: boolean;
  allSettled: boolean;
  groupEmoji?: string;
  onComplete: () => void;
}

export default function SettleAnimation({ visible, allSettled, groupEmoji, onComplete }: Props) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, allSettled ? 3000 : 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!show) return null;

  return (
    <Modal transparent visible={show} animationType="fade">
      <View style={styles.overlay}>
        {/* Confetti */}
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={Math.random() * 400}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            startX={Math.random() * SCREEN_WIDTH}
          />
        ))}

        {/* All Settled Message */}
        {allSettled && (
          <View style={styles.messageContainer}>
            <Text style={styles.celebrationEmoji}>{groupEmoji || '🎉'}</Text>
            <Text style={styles.celebrationTitle}>All Settled Up!</Text>
            <Text style={styles.celebrationSubtitle}>No more debts in this group</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 36, 0.95)',
    padding: 32,
    borderRadius: 20,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
