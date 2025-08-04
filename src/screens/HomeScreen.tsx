import React, {useMemo, useRef, useState, useCallback} from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Animated,
  Easing,
  SafeAreaView,
  Image
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

type Props = { navigation: any };

const GOLD = '#F6AE29';
const RED_BTN = '#BC221B';
const WHITE = '#FFFFFF';

type Tip = { title: string; text: string };

const TIPS: Tip[] = [
  { title: 'Wake up early to see Venice without the crowds.',
    text: "In the quiet of the morning, canals are still, bridges are empty, and the city feels like it belongs only to you." },
  { title: 'Avoid rolling large suitcases over bridges.',
    text: 'Venice has hundreds of bridges with steps — travel light or pack a backpack instead.' },
  { title: 'Stay on the main islands overnight.',
    text: "Evenings in Venice are magical once the day-trippers leave — you’ll discover a calmer, more authentic rhythm." },
  { title: 'Get lost on purpose.',
    text: 'Some of Venice’s most enchanting corners aren’t marked on any guide. Wander — and let the city surprise you.' },
  { title: 'Eat like a local: try cicchetti in a bacaro.',
    text: 'Cicchetti are small bites (like Venetian tapas). Locals enjoy them with a glass of wine while standing at the counter.' },
  { title: 'Avoid restaurants with photos on the menu.',
    text: 'They’re usually overpriced tourist traps. Look for menus in Italian and locals at the tables.' },
  { title: 'Make reservations — even for lunch.',
    text: 'Small, authentic places fill up fast. Book ahead to avoid disappointment.' },
  { title: 'Try Venetian specialties.',
    text: 'Sarde in saor, risotto al nero di seppia, or fegato alla veneziana — taste Venice’s history through flavor.' },
  { title: 'Use vaporetti instead of gondolas for budget travel.',
    text: 'Public water buses are affordable and still offer beautiful canal views.' },
  { title: 'Buy a multi-day ACTV pass.',
    text: 'It saves money and time — especially for island hopping to Murano or Burano.' },
  { title: 'Don’t rely on Google Maps alone.',
    text: 'Follow street signs to “Rialto”, “San Marco”, or “Ferrovia” — maps get confused in Venice.' },
  { title: 'Dress modestly when visiting churches.',
    text: 'Cover shoulders and knees — especially in St. Mark’s Basilica.' },
  { title: 'Avoid sitting on church steps or monuments.',
    text: 'It’s considered disrespectful and can be fined by city officials.' },
  { title: 'Learn a few Italian phrases.',
    text: 'Even a simple “Grazie” or “Buongiorno” goes a long way.' },
  { title: 'Respect the local pace and space.',
    text: 'You’re walking through their city — not just a postcard.' },
  { title: 'Visit San Giorgio Maggiore for the best view.',
    text: 'Take the elevator in the bell tower — quieter and with stunning panoramas.' },
  { title: 'Skip the gondola — take a traghetto.',
    text: 'It’s a stripped-down gondola to cross the Grand Canal for just a couple of euros.' },
  { title: 'Look for secret gardens.',
    text: 'Behind churches and palazzi you’ll find quiet green spots open to the public.' },
  { title: 'Spend an evening in Cannaregio.',
    text: 'A relaxed, local vibe — perfect for dinner or watching life along the canals.' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen({navigation}: Props): React.JSX.Element {
  const {width, height} = useWindowDimensions();
  const isSmallScreen = height < 750 || width < 380;

  const contentW = Math.min(345, Math.round(width - 32));
  const btnH = 45;
  const cardH = 145;

  const [tipIndex, setTipIndex] = useState(0);
  const tip = useMemo(() => TIPS[tipIndex % TIPS.length], [tipIndex]);

  const titleA = useRef(new Animated.Value(0)).current;     
  const leadA  = useRef(new Animated.Value(0)).current;    
  const btn1A  = useRef(new Animated.Value(0)).current;   
  const btn2A  = useRef(new Animated.Value(0)).current;     
  const cardA  = useRef(new Animated.Value(0)).current;     
  const tipA   = useRef(new Animated.Value(1)).current;      

  const mkPressAnim = () => {
    const v = new Animated.Value(1);
    const onPressIn  = () => Animated.spring(v, {toValue: 0.95, useNativeDriver: true}).start();
    const onPressOut = () => Animated.spring(v, {toValue: 1,    useNativeDriver: true}).start();
    return {v, onPressIn, onPressOut};
  };
  const startA = mkPressAnim();
  const planA  = mkPressAnim();
  const anotherA = mkPressAnim();

  useFocusEffect(
    useCallback(() => {
      titleA.setValue(0);
      leadA.setValue(0);
      btn1A.setValue(0);
      btn2A.setValue(0);
      cardA.setValue(0);

      const titleIn = Animated.timing(titleA, {
        toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      });
      const leadIn  = Animated.timing(leadA,  {
        toValue: 1, duration: 400, delay: 80, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      });
      const btnsIn = Animated.stagger(90, [
        Animated.timing(btn1A, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(btn2A, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]);
      const cardIn = Animated.timing(cardA, {
        toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      });

      Animated.sequence([titleIn, leadIn, btnsIn, cardIn]).start();

      return () => {};
    }, [titleA, leadA, btn1A, btn2A, cardA])
  );

  const nextTip = () => {
    Animated.timing(tipA, {
      toValue: 0, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start(() => {
      let n = tipIndex;
      while (n === tipIndex) n = Math.floor(Math.random() * TIPS.length);
      setTipIndex(n);
      Animated.timing(tipA, {
        toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }).start();
    });
  };

  const contentPaddingTop = isSmallScreen ? 14 : 20;
  const contentPaddingBottom = isSmallScreen ? 14 : 20;

  const titleStyle = {
    opacity: titleA,
    transform: [
      { translateY: titleA.interpolate({inputRange:[0,1], outputRange:[-18, 0]}) },
      { scale:      titleA.interpolate({inputRange:[0,1], outputRange:[0.98, 1]}) },
    ],
  };

  const leadStyle = {
    opacity: leadA,
    transform: [{ translateY: leadA.interpolate({inputRange:[0,1], outputRange:[-6, 0]}) }],
  };

  const btn1Style = {
    opacity: btn1A,
    transform: [{ translateY: btn1A.interpolate({inputRange:[0,1], outputRange:[20, 0]}) }],
  };

  const btn2Style = {
    opacity: btn2A,
    transform: [{ translateY: btn2A.interpolate({inputRange:[0,1], outputRange:[24, 0]}) }],
  };

  const cardStyle = {
    opacity: cardA,
    transform: [{ translateY: cardA.interpolate({inputRange:[0,1], outputRange:[28, 0]}) }],
  };

  const Content = (
    <>
      <View style={[styles.centerBlock, { width: contentW }]}>

        <Animated.Text style={[styles.title, { fontSize: isSmallScreen ? 24 : 29 }, titleStyle]}>
          Explore the Beauty of Venice
        </Animated.Text>

        <Animated.Text style={[styles.lead, { fontSize: isSmallScreen ? 14 : 18 }, leadStyle]}>
          Plan your journey, uncover Venice’s secrets, and make every step unforgettable.
          Explore landmarks, discover cultural gems, and savor local flavors
        </Animated.Text>
      </View>
      <View style={[styles.centerBlock, { width: contentW, marginTop: isSmallScreen ? 12 : 14 }]}>
        <AnimatedTouchable
          activeOpacity={0.9}
          onPressIn={startA.onPressIn}
          onPressOut={startA.onPressOut}
          style={[
            styles.btn,
            {
              backgroundColor: RED_BTN,
              borderColor: '#F5F5F5',
              borderWidth: 2,
              height: btnH,
              transform: [{scale: startA.v}],
            },
            btn1Style,
          ]}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={[styles.btnText, { color: WHITE }]}>Start Exploring</Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          activeOpacity={0.9}
          onPressIn={planA.onPressIn}
          onPressOut={planA.onPressOut}
          style={[
            styles.btn,
            { backgroundColor: GOLD, height: btnH, marginTop: 12, transform: [{scale: planA.v}] },
            btn2Style,
          ]}
          onPress={() => navigation.navigate('Plan')}
        >
          <Text style={[styles.btnText, { color: '#1C1C1E' }]}>Plan Your Trip</Text>
        </AnimatedTouchable>
      </View>
      <Animated.View
        style={[
          styles.card,
          {
            width: contentW,
            minHeight: cardH,
            marginTop: isSmallScreen ? 18 : 22,
            backgroundColor: 'rgba(101,0,6,0.88)',
            borderColor: 'rgba(255,255,255,0.25)',
          },
          cardStyle,
        ]}
      >
        <Text style={[styles.cardTitle, { fontSize: isSmallScreen ? 16 : 18 }]}>
          Travel Tips
        </Text>
        <Animated.View style={{opacity: tipA}}>
          <Text style={[styles.cardSub, { fontSize: isSmallScreen ? 16 : 18, color: GOLD }]}>
            {tip.title}
          </Text>
          <Text style={[styles.cardText, { fontSize: isSmallScreen ? 15 : 18 }]}>
            {tip.text}
          </Text>
        </Animated.View>
      </Animated.View>
      <AnimatedTouchable
        activeOpacity={0.95}
        onPressIn={anotherA.onPressIn}
        onPressOut={anotherA.onPressOut}
        style={[
          styles.anotherBtn,
          { width: contentW, height: btnH, backgroundColor: GOLD, marginTop: isSmallScreen ? 12 : 14, transform:[{scale: anotherA.v}] },
        ]}
        onPress={nextTip}
      >
        <Text style={[styles.anotherBtnText]}>Another Tip</Text>
      </AnimatedTouchable>
    </>
  );

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        {isSmallScreen ? (
          <View
            style={[
              styles.scrollContent,
              { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom },
            ]}
          >
            {Content}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {Content}
          </ScrollView>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
  scrollContent: { alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  centerBlock: { alignItems: 'center' },

  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  lead: {
    marginTop: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.97,
  },

  btn: {
    width: '100%',
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700', fontSize: 16 },

  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderWidth: 1,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSub: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardText: {
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },

  anotherBtn: {
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anotherBtnText: {
    color: '#1C1C1E',
    fontWeight: '700',
    fontSize: 16,
  },
});
