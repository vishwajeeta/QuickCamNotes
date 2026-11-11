
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const EXIT_DURATION = 1800;

const splashKeyframe = new Keyframe({
  0: { opacity: 1 },
  75: { opacity: 1 },
  100: { opacity: 0 },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.65 }],
  },
  65: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
    easing: Easing.out(Easing.back(1.5)),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
});

const titleKeyframe = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: 12 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }],
    easing: Easing.out(Easing.cubic),
  },
});

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const logo = (
    <Image
      source={require('@/assets/images/icon.png')}
      style={styles.logo}
      contentFit="contain"
    />
  );

  const content = (
    <View style={styles.content}>
      <Animated.View
        entering={logoKeyframe.duration(900)}
        style={styles.logoContainer}
      >
        {logo}
      </Animated.View>

      <Animated.Text
        entering={titleKeyframe.duration(650).delay(350)}
        style={styles.title}
      >
        QuickCamNotes
      </Animated.Text>

      <Animated.Text
        entering={titleKeyframe.duration(650).delay(550)}
        style={styles.tagline}
      >
        Keep what matters.
      </Animated.Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe
        .duration(EXIT_DURATION)
        .withCallback(finished => {
          'worklet';
          if (finished) {
            scheduleOnRN(setVisible, false);
          }
        })}
      style={styles.splashOverlay}
    >
      {content}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {content}
    </View>
  );
}

export function AnimatedIcon() {
  return (
    <Animated.View
      entering={logoKeyframe.duration(900)}
      style={styles.logoContainer}
    >
      <Image
  source={require('@/assets/images/icon.png')}
  style={styles.logo}
  contentFit="contain"
/>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: '800',
    color: '#172033',
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: 7,
    fontSize: 14,
    color: '#64748B',
    letterSpacing: 0.3,
  },
});
