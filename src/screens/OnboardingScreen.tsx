import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  ListRenderItemInfo,
  Animated,
  Easing,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = { navigation: any };

const BASE_BTN_WIDTH = 142;
const BASE_BTN_HEIGHT = 50;
const BTN_COLOR = '#F6AE29';

const PAGES = [
  {
    key: 'one',
    bg: require('../assets/background_onboarding_one.png'),
    title: `Welcome to Your Days\nin Venezia`,
    body:
      `Discover the charm of Venice at your\n` +
      `own rhythm. Explore iconic landmarks, hidden\n` +
      `gems, and local flavors — all in one`,
    rightButton: 'Next',
  },
  {
    key: 'two',
    bg: require('../assets/background_onboarding_three.png'),
    title: `Plan Your Trip. Get Lost\non Purpose`,
    body:
      `Save places, build custom day plans, and\n` +
      `read travel tips that matter.\n` +
      `Whether you're a dreamer or a\n` +
      `planner — Venice is yours to explore`,
    rightButton: 'Get Started',
  },
] as const;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function OnboardingScreen({navigation}: Props): React.JSX.Element {
  const {width, height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<any>>(null);
  const [page, setPage] = useState(0);
  const isSmall = height < 700 || width < 360;
  const titleSize = isSmall ? 24 : 28;
  const titleLineHeight = Math.round(titleSize * 1.2); 
  const bodySize = isSmall ? 14 : 16;
  const bodyLineHeight = Math.round(bodySize * 1.35);  
  const sidePad = isSmall ? 16 : 24;
  const bottomOffset = (isSmall ? 36 : 44) + insets.bottom; 

  const btnWidth = Math.max(120, Math.min(BASE_BTN_WIDTH, Math.round(width * 0.38)));
  const btnHeight = Math.max(44, Math.min(BASE_BTN_HEIGHT, Math.round(height * 0.06)));
  const btnRadius = Math.round(btnHeight / 2);

  const aTitle = useRef(new Animated.Value(0)).current; 
  const aBody  = useRef(new Animated.Value(0)).current; 
  const aLeft  = useRef(new Animated.Value(0)).current; 
  const aRight = useRef(new Animated.Value(0)).current; 
  const mkPress = () => {
    const v = new Animated.Value(1);
    const onPressIn  = () => Animated.spring(v, {toValue: 0.94, useNativeDriver: true}).start();
    const onPressOut = () => Animated.spring(v, {toValue: 1,    useNativeDriver: true}).start();
    return {v, onPressIn, onPressOut};
  };
  const pressSkip = useMemo(mkPress, []);
  const pressCTA  = useMemo(mkPress, []);
  useEffect(() => {
    aTitle.setValue(0);
    aBody.setValue(0);
    aLeft.setValue(0);
    aRight.setValue(0);

    const titleIn = Animated.timing(aTitle, {
      toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    const bodyIn  = Animated.timing(aBody,  {
      toValue: 1, duration: 400, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    });
    const rowIn   = Animated.parallel([
      Animated.timing(aLeft,  { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(aRight, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]);

    Animated.sequence([titleIn, bodyIn, rowIn]).start();
  }, [page, aTitle, aBody, aLeft, aRight]);
  const titleStyle = {
    opacity: aTitle,
    transform: [
      { translateY: aTitle.interpolate({inputRange:[0,1], outputRange:[-16, 0]}) },
      { scale:      aTitle.interpolate({inputRange:[0,1], outputRange:[0.98, 1]}) },
    ],
  };
  const bodyStyle = {
    opacity: aBody,
    transform: [{ translateY: aBody.interpolate({inputRange:[0,1], outputRange:[-6, 0]}) }],
  };
  const leftStyle = {
    opacity: aLeft,
    transform: [{ translateX: aLeft.interpolate({inputRange:[0,1], outputRange:[-24, 0]}) }],
  };
  const rightStyle = {
    opacity: aRight,
    transform: [{ translateX: aRight.interpolate({inputRange:[0,1], outputRange:[24, 0]}) }],
  };
  const renderItem = ({item, index}: ListRenderItemInfo<(typeof PAGES)[number]>) => {
    const isActive = index === page;
    const inactiveStyle = !isActive ? {opacity: 0} : undefined;

    return (
      <ImageBackground source={item.bg} style={{width, height}} resizeMode="cover">
        <View style={[styles.bottomWrap, {paddingHorizontal: sidePad, width, bottom: bottomOffset}]}>
          <View style={styles.textBlock}>
            <Animated.Text
              style={[styles.title, {fontSize: titleSize, lineHeight: titleLineHeight}, isActive ? titleStyle : inactiveStyle]}
            >
              {item.title}
            </Animated.Text>

            <Animated.Text
              style={[styles.body, {fontSize: bodySize, lineHeight: bodyLineHeight}, isActive ? bodyStyle : inactiveStyle]}
            >
              {item.body}
            </Animated.Text>
          </View>

          <View style={styles.actionsRow}>
            {item.key === 'one' ? (
              <AnimatedTouchable
                onPressIn={pressSkip.onPressIn}
                onPressOut={pressSkip.onPressOut}
                style={[isActive ? leftStyle : inactiveStyle, {transform:[...(isActive ? leftStyle.transform : []), {scale: pressSkip.v}]}]}
                onPress={() => navigation.replace('MainTabs')}
                hitSlop={10}
                activeOpacity={0.9}
              >
                <Text style={[styles.skipText, {fontSize: isSmall ? 16 : 18}]}>Skip</Text>
              </AnimatedTouchable>
            ) : (
              <View style={{width: btnWidth}} />
            )}
            <AnimatedTouchable
              activeOpacity={0.9}
              onPressIn={pressCTA.onPressIn}
              onPressOut={pressCTA.onPressOut}
              style={[
                styles.cta,
                { width: btnWidth, height: btnHeight, borderRadius: btnRadius },
                isActive ? rightStyle : inactiveStyle,
                { transform:[...(isActive ? rightStyle.transform : []), {scale: pressCTA.v}] },
              ]}
              onPress={() => {
                if (item.key === 'one') {
                  listRef.current?.scrollToIndex({index: 1, animated: true});
                } else {
                  navigation.replace('MainTabs');
                }
              }}>
              <Text style={[styles.ctaText, {fontSize: isSmall ? 15 : 16}]}>
                {item.rightButton}
              </Text>
            </AnimatedTouchable>
          </View>
        </View>
      </ImageBackground>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({length: width, offset: width * index, index})}
        onMomentumScrollEnd={(e) => {
          const newPage = Math.round(e.nativeEvent.contentOffset.x / width);
          if (newPage !== page) setPage(newPage);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#000'}, 
  bottomWrap: { position: 'absolute', left: 0, right: 0 },
  textBlock: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    marginTop: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.98,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cta: {
    backgroundColor: BTN_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#1C1C1E',
    fontWeight: '700',
  },
});
