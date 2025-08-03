import React, {useMemo, useState, useRef, useCallback, useEffect} from 'react';
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Share,
  Alert,
  ScrollView,
  Modal,
  Platform,
  Animated,
  Easing,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const GOLD      = '#F6AE29';
const WHITE     = '#FFFFFF';
const ROW_BG    = '#650006';
const PANEL_BG  = 'rgba(101,0,6,0.92)';
const BORDER    = 'rgba(255,255,255,0.30)';
const TEXT_DIM  = 'rgba(255,255,255,0.95)';

const KEY_NOTIFS = 'settings_notifications_v1';
const APP_KEYS   = [
  'plan_saved_days_v1',
  'explore_favs_v1',
  'user_custom_coords_v1',
  'user_selected_places_v1',
  'map_region_state',
  'last_opened_place',
  KEY_NOTIFS
];

const ICONS = {
    crown: require('../assets/crown.png'),
    share: require('../assets/share.png'), 
};

export default function SettingsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [viewport, setViewport] = useState({w: 0, h: 0});
  const isSmall = viewport.h && (viewport.h < 740 || viewport.w < 360);

  const contentW  = useMemo(() => Math.min(360, Math.round((viewport.w || 390) - 32)), [viewport.w]);
  const topPad    = (isSmall ? 52 : 66) + insets.top;
  const bottomPad = 90 + 16 + insets.bottom;

  const [notifications, setNotifications] = useState<boolean>(true);
  const [askReset, setAskReset]           = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;
  
  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      translateAnim.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      return undefined;
    }, [fadeAnim, translateAnim])
  );

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY_NOTIFS);
        if (raw != null) setNotifications(raw === '1');
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(KEY_NOTIFS, notifications ? '1' : '0').catch(() => {});
  }, [notifications]);

  const onShareApp = async () => {
    try {
      await Share.share({
        message:
          "Explore Venice with me! 🇮🇹\nYour Days in Venezia — plan routes, save places and discover hidden gems.",
      });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message ?? 'Unknown error');
    }
  };

  const onResetAll = async () => {
    try {
      await Promise.all(APP_KEYS.map(k => AsyncStorage.removeItem(k)));
      setNotifications(true);
      setAskReset(false);
      Alert.alert('Done', 'All app data has been reset.');
    } catch (e) {
      setAskReset(false);
      Alert.alert('Error', 'Could not reset data, please try again.');
    }
  };

  return (
    <ImageBackground
      onLayout={e => {
        const {width, height} = e.nativeEvent.layout;
        setViewport({w: width, h: height});
      }}
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
          flex: 1,
          width: '100%',
        }}
      >
        <ScrollView
          contentContainerStyle={{paddingTop: topPad, paddingBottom: bottomPad, alignItems: 'center'}}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={ICONS.crown}
            style={{ width: 70, height: 70, marginBottom: 10 }}
            resizeMode="contain"
          />
          <Text style={[styles.title, {fontSize: isSmall ? 22 : 24}]}>Settings</Text>

          <View style={[styles.row, {width: contentW}]}>
            <Text style={styles.rowText}>Notifications</Text>
            <View style={styles.rowRight}>
              <Switch
                trackColor={{false: 'rgba(255,255,255,0.25)', true: GOLD}}
                thumbColor={WHITE}
                ios_backgroundColor="rgba(255,255,255,0.25)"
                value={notifications}
                onValueChange={setNotifications}
                style={{transform: [{scale: Platform.OS === 'android' ? 1.05 : 1}]}}
              />
            </View>
          </View>
          
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.row, {width: contentW}]}
            onPress={onShareApp}
          >
            <Text style={styles.rowText}>Share the app</Text>
            <View style={styles.iconBadge}>
              <Image source={ICONS.share} style={{ width: 18, height: 18, tintColor: WHITE }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.row, {width: contentW}]}
            onPress={() => setAskReset(true)}
          >
            <Text style={styles.rowText}>Reset All Data</Text>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>↻</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
      <Modal visible={askReset} transparent animationType="fade" onRequestClose={() => setAskReset(false)}>
        <View style={styles.dim}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Reset All Data?</Text>
            <Text style={styles.alertText}>
              This will remove saved plans, favorites, and settings on this device. Are you sure?
            </Text>
            <View style={styles.alertRow}>
              <TouchableOpacity style={styles.alertBtn} onPress={() => setAskReset(false)}>
                <Text style={styles.alertBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.alertBtn, styles.alertBtnGold]} onPress={onResetAll}>
                <Text style={[styles.alertBtnText, {color: '#1C1C1E', fontWeight: '700'}]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {flex: 1, backgroundColor: '#000'},
  title: {
    color: WHITE,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  row: {
    minHeight: 56,
    borderRadius: 22,
    backgroundColor: ROW_BG,
    borderWidth: 1.25,
    borderColor: BORDER,
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {color: TEXT_DIM, fontSize: 16, fontWeight: '700', flex: 1},
  rowRight: {marginLeft: 12},

  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: BORDER,
    marginLeft: 10,
  },
  iconBadgeText: {color: WHITE, fontWeight: '700', fontSize: 16},

  dim: {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20},
  alertCard: {
    width: '100%', maxWidth: 360,
    backgroundColor: PANEL_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  alertTitle: {color: WHITE, fontWeight: '700', fontSize: 18, textAlign: 'center', marginBottom: 6},
  alertText: {color: TEXT_DIM, textAlign: 'center', lineHeight: 20, marginBottom: 12},
  alertRow: {flexDirection: 'row', justifyContent: 'center', gap: 10},
  alertBtn: {
    height: 42, paddingHorizontal: 16, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  alertBtnGold: {backgroundColor: GOLD},
  alertBtnText: {color: WHITE, fontSize: 16},
});