import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  Image,
  Modal,
  ScrollView,
  Share,
  Alert,
  Animated,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';

import { PLACES, type Place } from '../data/explore';

const GOLD = '#F6AE29';
const BAR_BG = '#650006';
const PIN_COLOR = '#8C1A1A';
const WHITE = '#FFFFFF';
const TAB_HEIGHT = 90;

const ICONS = {
  back: require('../assets/back.png'),
  share: require('../assets/share.png'),
};

type MapRouteParams = {
  Map?: { lat?: number; lng?: number; title?: string; id?: string };
};

export default function MapScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<MapRouteParams, 'Map'>>();
  const navigation = useNavigation();

  const mapRef = useRef<MapView | null>(null);
  const lastMarkerTapTs = useRef(0);

  const [selected, setSelected] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const useGoogleProvider = Platform.OS === 'android';

  const markers: Place[] = useMemo(() => PLACES.filter(p => !!p.coords), []);

  const initialRegion: Region = useMemo(
    () => ({
      latitude: 45.4380,
      longitude: 12.3358,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    []
  );

  const inFav = useCallback((id: string) => !!favorites[id], [favorites]);

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const animateToPlace = useCallback((lat: number, lng: number, duration = 700) => {
    const region: Region = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
    mapRef.current?.animateToRegion(region, duration);
  }, []);

  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewTranslate = useRef(new Animated.Value(10)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const mapFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected && !showDetails) {
      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(previewTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      previewOpacity.setValue(0);
      previewTranslate.setValue(10);
      buttonOpacity.setValue(0);
    }
  }, [selected, showDetails]);

  useEffect(() => {
    if (showMap) {
      Animated.timing(mapFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      mapFade.setValue(0);
    }
  }, [showMap]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (Platform.OS === 'android') {
        setShowMap(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const p = route.params;
      const hasIncoming = !!(p && typeof p.lat === 'number' && typeof p.lng === 'number');

      if (Platform.OS === 'android' && !showMap) {
        const timer = setTimeout(() => {
          setShowMap(true);
          if (hasIncoming) {
            animateToPlace(p.lat!, p.lng!, 0);
          } else {
            mapRef.current?.animateToRegion(initialRegion, 0);
          }
        }, 100);
        return () => clearTimeout(timer);
      } else if (hasIncoming) {
        animateToPlace(p.lat!, p.lng!);
      }

      if (hasIncoming) {
        const target = markers.find(
          m => Math.abs(m.coords.lat - p.lat!) < 1e-6 && Math.abs(m.coords.lng - p.lng!) < 1e-6
        );
        if (target) {
          setSelected(target);
        }
      } else {
        setSelected(null);
      }
      
      return undefined;
    }, [showMap, route.params, markers, animateToPlace, initialRegion])
  );

  const onPressMarker = (p: Place) => {
    lastMarkerTapTs.current = Date.now();
    animateToPlace(p.coords.lat, p.coords.lng, 400);
    setSelected(p);
    setShowDetails(false);
  };

  const onMapPress = () => {
    const dt = Date.now() - lastMarkerTapTs.current;
    if (dt < 250) return;
    setSelected(null);
    setShowDetails(false);
  };

  const onSharePlace = async (p: Place) => {
    try {
      const msg =
        `${p.title}\n` +
        (p.coordText ? `Coordinates: ${p.coordText}\n` : '') +
        `\n${p.description}\n\nWhy Visit: ${p.why}`;
      await Share.share({ message: msg });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message ?? 'Unknown error');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
      />

      {showMap && (
        <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: mapFade }}>
          <MapView
            key={showMap.toString()}
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            provider={useGoogleProvider ? PROVIDER_GOOGLE : undefined}
            initialRegion={initialRegion}
            onPress={onMapPress}
            showsUserLocation={false}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            showsCompass={false}
            rotateEnabled={false}
          >
            {markers.map(m => (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.coords.lat, longitude: m.coords.lng }}
                onPress={() => onPressMarker(m)}
              >
                <View style={styles.pin}>
                  <View style={styles.pinDot} />
                </View>
              </Marker>
            ))}
          </MapView>
        </Animated.View>
      )}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.topTitle}>Map of Venice</Text>
      </View>
      {selected && !showDetails && (
        <View style={styles.previewWrap} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.previewCard,
              {
                opacity: previewOpacity,
                transform: [{ translateY: previewTranslate }],
              },
            ]}
          >
            {selected.image ? (
              <Image source={selected.image} style={styles.previewImg} />
            ) : (
              <View style={[styles.previewImg, { backgroundColor: '#8F1D25' }]} />
            )}
            <Text style={styles.previewTitle} numberOfLines={1}>
              {selected.title}
            </Text>
          </Animated.View>
        </View>
      )}
      {selected && !showDetails && (
        <Animated.View
          style={[
            styles.bottomWrap,
            {
              bottom: TAB_HEIGHT + 20 + insets.bottom,
              opacity: buttonOpacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.routeBtn}
            onPress={() => setShowDetails(true)}
          >
            <Text style={styles.routeText}>Show Details</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <Modal
        visible={!!selected && showDetails}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: 16 + insets.bottom }]}>
            {selected?.image ? (
              <Image source={selected.image} style={styles.modalImage} />
            ) : (
              <View style={[styles.modalImage, { backgroundColor: '#8F1D25' }]} />
            )}

            <View
              style={[
                styles.modalTopButtons,
                {
                  paddingTop: Platform.OS === 'android' ? insets.top + 8 : 12,
                  paddingHorizontal: 14,
                },
              ]}
            >
              <TouchableOpacity onPress={() => setShowDetails(false)} style={styles.topIcon}>
                <Image source={ICONS.back} style={styles.topIconImg} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={() => selected && onSharePlace(selected)} style={styles.topIcon}>
                  <Image source={ICONS.share} style={styles.topIconImg} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selected && toggleFav(selected.id)}
                  style={styles.topIcon}
                >
                  <Text
                    style={{
                      color: selected && inFav(selected.id) ? GOLD : WHITE,
                      fontSize: 18,
                      fontWeight: '700',
                      includeFontPadding: false,
                      textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
                      lineHeight: Platform.OS === 'android' ? 18 : undefined,
                    }}
                  >
                    {selected && inFav(selected.id) ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selected?.title}</Text>
              {!!selected?.coordText && <Text style={styles.modalCoords}>{selected.coordText}</Text>}
              {!!selected?.description && <Text style={styles.modalParagraph}>{selected.description}</Text>}
              {!!selected?.why && (
                <>
                  <Text style={styles.modalWhyTitle}>Why Visit:</Text>
                  <Text style={styles.modalParagraph}>{selected.why}</Text>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  topBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topTitle: {
    color: '#1C1C1E',
    fontWeight: '700',
    fontSize: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },

  previewWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '28%',
    alignItems: 'center',
    zIndex: 5,
  },
  previewCard: {
    width: 200,
    borderRadius: 18,
    backgroundColor: 'rgba(28,28,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  previewImg: { width: '100%', height: 110, resizeMode: 'cover' },
  previewTitle: { color: '#fff', fontWeight: '700', paddingHorizontal: 10, paddingVertical: 8 },

  bottomWrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center', zIndex: 5 },
  routeBtn: {
    height: 46, borderRadius: 23, backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },
  routeText: { color: '#1C1C1E', fontWeight: '700', fontSize: 16, paddingHorizontal: 18 },

  pin: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff',
    borderWidth: 3, borderColor: PIN_COLOR, alignItems: 'center', justifyContent: 'center',
  },
  pinDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PIN_COLOR },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: BAR_BG, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden', maxHeight: '92%' },
  modalImage: { width: '100%', height: 240, resizeMode: 'cover' },
  modalTopButtons: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  topIcon: {
    width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.25, borderColor: GOLD, backgroundColor: 'rgba(0,0,0,0.65)',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  topIconImg: {
    width: 18, height: 18, tintColor: WHITE,
  },

  modalTitle: { color: WHITE, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  modalCoords: { color: 'rgba(255,255,255,0.9)', marginBottom: 8 },
  modalParagraph: { color: 'rgba(255,255,255,0.95)', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  modalWhyTitle: { color: WHITE, fontWeight: '700', marginTop: 4, marginBottom: 6 },
});