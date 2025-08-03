import React, {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import {
  Image,
  ImageBackground,
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Modal,
  ScrollView,
  Share,
  Alert,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import { CATEGORIES, PLACES, type Place, type Category } from '../data/explore';

const GOLD = '#F6AE29';
const PANEL_BG = '#650006';
const WHITE = '#FFFFFF';

const ICONS = {
  back: require('../assets/back.png'),
  share: require('../assets/share.png'),
};

export default function ExploreScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const isSmall = height < 730 || width < 360;

  const topPad = (isSmall ? 44 : 54) + insets.top;
  const bottomPad = 90 + 16 + insets.bottom;
  const sidePad = isSmall ? 12 : 16;

  const [activeCat, setActiveCat] = useState<Category>('Must-See Spots');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [favRank, setFavRank] = useState<Record<string, number>>({});
  const [rankCounter, setRankCounter] = useState(0);
  const [selected, setSelected] = useState<Place | null>(null);

  const flatListAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const animateFlatListContent = useCallback(() => {
    flatListAnim.setValue(0);
    Animated.timing(flatListAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [flatListAnim]);

  const animateModalIn = useCallback(() => {
    modalAnim.setValue(0);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [modalAnim]);

  const animateModalOut = useCallback((cb?: () => void) => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => cb?.());
  }, [modalAnim]);

  useEffect(() => {
    animateFlatListContent();
  }, [activeCat, animateFlatListContent]);

  useEffect(() => {
    if (selected) {
      animateModalIn();
    } else {
      animateModalOut(() => {
        if (!selected) setSelected(null);
      });
    }
  }, [selected, animateModalIn, animateModalOut]);

  const inFav = useCallback((id: string) => !!favorites[id], [favorites]);

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = {...prev};
      if (next[id]) {
        delete next[id];
        setFavRank(r => {
          const rr = {...r};
          delete rr[id];
          return rr;
        });
      } else {
        next[id] = true;
        setRankCounter(c => {
          const newC = c + 1;
          setFavRank(r => ({...r, [id]: newC}));
          return newC;
        });
      }
      return next;
    });
  }, []);

  const baseInCategory = useMemo(
    () => PLACES.filter(p => p.category === activeCat),
    [activeCat]
  );

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? baseInCategory.filter(p =>
          (p.title + ' ' + p.description + ' ' + p.why).toLowerCase().includes(q),
        )
      : baseInCategory;

    const indexMap = new Map<string, number>();
    filtered.forEach((p, i) => indexMap.set(p.id, i));

    return filtered.slice().sort((a, b) => {
      const aFav = inFav(a.id);
      const bFav = inFav(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      if (aFav && bFav) {
        const ar = favRank[a.id] ?? 0;
        const br = favRank[b.id] ?? 0;
        return br - ar;
      }
      return (indexMap.get(a.id)! - indexMap.get(b.id)!);
    });
  }, [baseInCategory, query, favorites, favRank, inFav]);

  const onSharePlace = useCallback(async (p: Place) => {
    try {
      const msg =
        `${p.title}\n` +
        (p.coordText ? `Coordinates: ${p.coordText}\n` : '') +
        `\n${p.description}\n\nWhy Visit: ${p.why}`;
      await Share.share({ message: msg });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message ?? 'Unknown error');
    }
  }, []);

  const renderCard = ({item}: {item: Place}) => (
    <View style={styles.card}>
      {item.image ? (
        <Image source={item.image} style={styles.thumbImg} />
      ) : (
        <View style={styles.thumbStub} />
      )}

      <View style={styles.cardMiddle}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardExcerpt} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      <View style={styles.cardRight}>
        <TouchableOpacity
          onPress={() => toggleFav(item.id)}
          style={[styles.roundBtn, styles.roundBtnDim]}
          hitSlop={8}
        >
          <Text
            style={{
              color: inFav(item.id) ? GOLD : WHITE,
              fontSize: 18,
              includeFontPadding: false,
              textAlignVertical: Platform.OS === 'android' ? 'center' : 'auto',
              lineHeight: Platform.OS === 'android' ? 18 : undefined,
            }}
          >
            {inFav(item.id) ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelected(item)}
          style={[styles.roundBtn, styles.roundBtnGold, {marginTop: 10}]}
          hitSlop={8}
        >
          <Image
            source={ICONS.back}
            style={[styles.iconImg, {transform: [{rotate: '180deg'}]}]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const flatListStyle = {
    opacity: flatListAnim.interpolate({inputRange: [0, 1], outputRange: [0, 1]}),
    transform: [{translateY: flatListAnim.interpolate({inputRange: [0, 1], outputRange: [50, 0]})}],
  };

  const modalContainerStyle = {
    opacity: modalAnim.interpolate({inputRange: [0, 1], outputRange: [0, 1]}),
    transform: [{translateY: modalAnim.interpolate({inputRange: [0, 1], outputRange: [height, 0]})}],
  };

  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.FlatList
        style={flatListStyle}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: bottomPad,
          paddingHorizontal: sidePad,
        }}
        ListHeaderComponent={
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('../assets/crown.png')}
              style={{ width: 70, height: 70, marginBottom: 10 }}
              resizeMode="contain"
            />
            <Text style={[styles.title, {fontSize: isSmall ? 26 : 28}]}>
              Explore the Beauty of Venice
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingVertical: 12}}
            >
              {CATEGORIES.map(cat => {
                const active = cat === activeCat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setActiveCat(cat)}
                    activeOpacity={0.9}
                    style={[
                      styles.pill,
                      active
                        ? {backgroundColor: GOLD}
                        : {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.35)',
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        active ? {color: '#1C1C1E'} : undefined,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.searchWrap}>
              <View style={styles.searchIcon}>
                <Text style={{color: GOLD}}>🔍</Text>
              </View>
              <TextInput
                placeholder="Search locations ..."
                placeholderTextColor="rgba(255,255,255,0.85)"
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
            </View>
          </View>
        }
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        ItemSeparatorComponent={() => <View style={{height: 12}} />}
        ListEmptyComponent={
          <View style={{alignItems: 'center', paddingVertical: 48}}>
            <Text style={styles.emptyText}>
              Nothing found. Try a different keyword or{'\n'}explore another category
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        extraData={{favorites, favRank}}
      />
      <Modal
        visible={!!selected}
        animationType="none"
        transparent
        onRequestClose={() => animateModalOut(() => setSelected(null))}
      >
        <Animated.View style={[styles.modalBackdrop, modalContainerStyle]}>
          <View style={[styles.modalCard, {paddingBottom: 16 + insets.bottom}]}>
            {selected?.image ? (
              <Image source={selected.image} style={styles.modalImage} />
            ) : (
              <View style={[styles.modalImage, {backgroundColor: '#8F1D25'}]} />
            )}

            <View style={styles.modalTopButtons}>
              <TouchableOpacity
                onPress={() => animateModalOut(() => setSelected(null))}
                style={[styles.topIcon]}
              >
                <Image source={ICONS.back} style={styles.topIconImg} />
              </TouchableOpacity>

              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity
                  onPress={() => selected && onSharePlace(selected)}
                  style={[styles.topIcon]}
                >
                  <Image source={ICONS.share} style={styles.topIconImg} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selected && toggleFav(selected.id)}
                  style={[styles.topIcon]}
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

            <ScrollView contentContainerStyle={{padding: 16}} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{selected?.title}</Text>
              {selected?.coordText ? (
                <Text style={styles.modalCoords}>{selected.coordText}</Text>
              ) : null}

              <Text style={styles.modalParagraph}>{selected?.description}</Text>

              {selected?.why ? (
                <>
                  <Text style={styles.modalWhyTitle}>Why Visit:</Text>
                  <Text style={styles.modalParagraph}>{selected.why}</Text>
                </>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.95}
                style={styles.mapBtn}
                onPress={() => {
                  if (selected) {
                    navigation.navigate('Map', {
                      lat: selected.coords.lat,
                      lng: selected.coords.lng,
                      title: selected.title,
                    });
                    setSelected(null);
                  }
                }}
              >
                <Text style={styles.mapBtnText}>Show on Map</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
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
  },

  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
  },
  pillText: {
    color: WHITE,
    fontWeight: '700',
    fontSize: 13,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(245,245,245,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  searchIcon: {
    width: 28, height: 28, borderRadius: 14,
    alignItems:'center', justifyContent:'center',
    marginRight: 6,
    backgroundColor:'rgba(246,174,41,0.15)',
  },
  searchInput: { flex:1, color: WHITE, fontSize: 16, paddingVertical: 8 },

  card: {
    flexDirection:'row',
    borderRadius: 14,
    padding: 10,
    backgroundColor: 'rgba(101,0,6,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  thumbImg: {
    width: 64, height: 64, borderRadius: 10, marginRight: 10, resizeMode: 'cover',
  },
  thumbStub: {
    width: 64, height: 64, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', marginRight: 10,
  },
  cardMiddle: {flex:1, justifyContent:'center'},
  cardTitle: {color: WHITE, fontWeight:'700', fontSize: 16, marginBottom: 4},
  cardExcerpt: {color:'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18},
  cardRight: {justifyContent:'center', alignItems:'center', marginLeft: 6},

  roundBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems:'center', justifyContent:'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  roundBtnDim: { backgroundColor: 'rgba(255,255,255,0.15)' },
  roundBtnGold: { backgroundColor: GOLD },

  iconImg: { width: 16, height: 16, tintColor: '#1C1C1E' },

  emptyText: { color: WHITE, textAlign:'center', opacity: 0.95, lineHeight: 22 },

  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  modalCard: { backgroundColor: PANEL_BG, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow:'hidden', maxHeight:'92%' },
  modalImage: { width:'100%', height: 240, resizeMode:'cover' },

  topIcon: {
    width: 44, height: 44, borderRadius: 22,
    alignItems:'center', justifyContent:'center',
    borderWidth: 1.25, borderColor: GOLD,
    backgroundColor: 'rgba(0,0,0,0.65)',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: {width:0, height:2},
    elevation: 6,
  },
  topIconImg: {
    width: 18, height: 18, tintColor: WHITE,
  },

  modalTopButtons: {
    position:'absolute', top: 14, left: 14, right: 14,
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
  },

  modalTitle: { color: WHITE, fontSize: 20, fontWeight:'700', marginBottom: 4 },
  modalCoords:{ color:'rgba(255,255,255,0.9)', marginBottom: 8 },
  modalParagraph:{ color:'rgba(255,255,255,0.95)', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  modalWhyTitle:{ color: WHITE, fontWeight:'700', marginTop: 4, marginBottom: 6 },

  mapBtn: {
    backgroundColor: GOLD, height: 50, borderRadius: 25,
    alignItems:'center', justifyContent:'center', marginTop: 8,
  },
  mapBtnText: { color:'#1C1C1E', fontWeight:'700', fontSize: 16 },
});