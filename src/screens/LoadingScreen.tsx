import React, { useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Animated,
  Easing,
  useWindowDimensions,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG_COLOR = '#B4010B';

type Props = {
  navigation: any;
};

export default function LoadingScreen({ navigation }: Props): React.JSX.Element {
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

    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 4000);

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG_COLOR} />
      <View style={styles.logoWrap}>
        <Animated.Image
          source={require('../assets/image_loader.png') as ImageSourcePropType}
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
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
