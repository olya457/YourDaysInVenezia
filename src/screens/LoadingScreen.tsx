import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Animated,
  Easing,
  useWindowDimensions,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG_COLOR = '#B4010B';

type Props = {
  navigation: any;
};

export default function LoadingScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isSmallH = height < 700;
  const isSmallW = width < 360;
  const isSmall = isSmallH || isSmallW;

  const logoMaxSide = Math.min(
    392,
    width * (isSmall ? 0.76 : 0.82),
    height * (isSmall ? 0.38 : 0.42),
  );

  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const crownOpacities = Array.from({ length: 5 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.03,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 1.0,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    });

    crownOpacities.forEach((opacity, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 400),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ]),
      ).start();
    });

    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3500 + Math.random() * 1500);

    return () => clearTimeout(t);
  }, []);

  const baseSize = 60;
  const crownData = [
    { top: 40, left: 30, scale: 1 },
    { top: height - 130, right: 40, scale: 0.8 },
    { top: 110, right: 30, scale: 0.6 },
    { top: height / 2 + 100, left: 40, scale: 1.2 },
    { bottom: 30, left: width / 2 - 40, scale: 0.9 },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      {crownData.map(({ scale, ...position }, index) => (
        <Animated.Image
          key={index}
          source={require('../assets/crown.png')}
          style={{
            position: 'absolute',
            width: baseSize,
            height: baseSize,
            resizeMode: 'contain',
            transform: [{ scale }],
            opacity: crownOpacities[index],
            ...position,
          }}
        />
      ))}

      <View style={styles.logoWrap}>
        <Animated.Image
          source={require('../assets/image_loader1.png') as ImageSourcePropType}
          style={{
            width: logoMaxSide,
            height: logoMaxSide,
            resizeMode: 'contain',
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_COLOR },
  logoWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
