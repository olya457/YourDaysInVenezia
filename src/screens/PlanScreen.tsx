import React, { useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Share,
  Platform,
  Alert,
  Image,
  Animated, 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


type PlanItem = {
  id: string;
  location: string;
  from: string;
  to: string;
  note: string;
};

type SavedDay = {
  id: string;
  dateLabel: string;
  items: PlanItem[];
};

const GOLD = '#F6AE29';
const WHITE = '#FFFFFF';
const PANEL = 'rgba(101,0,6,0.88)';
const ROW_BG = '#650006';
const STORE_KEY = 'plan_saved_days_v1';
const ICONS = {
  back: require('../assets/back.png'),
  crown: require('../assets/crown.png'),
};

export default function PlanScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();

  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const onLayoutRoot = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setViewport({ w: width, h: height });
  };
  const isSmall = viewport.h && (viewport.h < 740 || viewport.w < 360);

  const topPad = (isSmall ? 56 : 70) + insets.top;
  const bottomPad = 90 + 16 + insets.bottom;
  const contentW = Math.min(345, Math.round((viewport.w || 390) - 32));

  const [mode, setMode] = useState<'empty' | 'form' | 'list'>('empty');

  const [dateLabel, setDateLabel] = useState(getTodayLabel());
  const [items, setItems] = useState<PlanItem[]>([]);
  const [dirty, setDirty] = useState(false);

  const [saved, setSaved] = useState<SavedDay[]>([]);

  const [askLeave, setAskLeave] = useState(false);
  const [askDelete, setAskDelete] = useState<null | string>(null);

  const [showDate, setShowDate] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [showTime, setShowTime] = useState(false);
  const [timeTarget, setTimeTarget] = useState<{ id: string; field: 'from' | 'to' } | null>(null);
  const [tempTime, setTempTime] = useState<Date>(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);

      const loadSavedDays = async () => {
        try {
          const raw = await AsyncStorage.getItem(STORE_KEY);
          if (raw) {
            const parsed: SavedDay[] = JSON.parse(raw);
            setSaved(parsed);
            if (parsed.length) {
              setMode('list');
            } else {
              setMode('empty');
            }
          } else {
            setSaved([]);
            setMode('empty');
          }
        } catch (e) {
          console.warn('Failed to load saved days:', e);
          setSaved([]);
          setMode('empty');
        }
      };
      loadSavedDays();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, 
        useNativeDriver: true,
      }).start();

    }, [fadeAnim]) 
  );

  useEffect(() => {
    const saveDays = async () => {
      try {
        await AsyncStorage.setItem(STORE_KEY, JSON.stringify(saved));
      } catch (e) {
        console.warn('Failed to save days:', e);
      }
    };
    saveDays();
  }, [saved]);

  const canSave = useMemo(() => items.some(it => it.location.trim()), [items]);

  function startNewPlanToday() {
    setDateLabel(getTodayLabel());
    setItems([{ id: rid(), location: '', from: '', to: '', note: '' }]);
    setDirty(false);
    setMode('form');
  }
  function addItem() {
    setItems(prev => [...prev, { id: rid(), location: '', from: '', to: '', note: '' }]);
    setDirty(true);
  }
  function updateItem(id: string, patch: Partial<PlanItem>) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)));
    setDirty(true);
  }
  function removeItem(id: string) {
    setItems(prev => prev.filter(it => it.id !== id));
    setDirty(true);
  }
  function saveDay() {
    if (!canSave) return;
    const packed: SavedDay = {
      id: rid(),
      dateLabel,
      items: items.filter(i => i.location.trim()),
    };
    setSaved(prev => [packed, ...prev]);
    setItems([]);
    setDirty(false);
    setMode('list');
  }
  function handleBackFromForm() {
    dirty ? setAskLeave(true) : setMode(saved.length ? 'list' : 'empty');
  }

  async function deleteDay(dayIdToDelete: string) {
    try {
      const newSaved = saved.filter(day => day.id !== dayIdToDelete);
      setSaved(newSaved);
      setAskDelete(null);
      if (newSaved.length === 0) {
        setMode('empty');
      }
    } catch (e) {
      console.warn('Delete failed', e);
      Alert.alert('Error', 'Failed to delete plan. Please try again.');
    }
  }

  function openDatePicker() {
    setTempDate(parseDateFromLabel(dateLabel));
    setShowDate(true);
  }

  function onDateChange(event: DateTimePickerEvent, d?: Date) {
    setShowDate(false);
    if (event.type === 'set' && d) {
      setDateLabel(formatDateLabel(d));
      setDirty(true);
    }
  }

  function onTimeChange(event: DateTimePickerEvent, d?: Date) {
    setShowTime(false);
    if (event.type === 'set' && d && timeTarget) {
      updateItem(timeTarget.id, { [timeTarget.field]: toHHMM(d) } as any);
      setTimeTarget(null);
    }
  }

  function confirmDate() {
    setDateLabel(formatDateLabel(tempDate));
    setDirty(true);
    setShowDate(false);
  }
  function cancelDate() {
    setShowDate(false);
  }
  function confirmTime() {
    if (timeTarget) {
      updateItem(timeTarget.id, { [timeTarget.field]: toHHMM(tempTime) } as any);
    }
    setShowTime(false);
    setTimeTarget(null);
  }
  function cancelTime() {
    setShowTime(false);
    setTimeTarget(null);
  }

  function openTimePicker(id: string, field: 'from' | 'to') {
    setTimeTarget({ id, field });
    const base = new Date();
    base.setSeconds(0, 0);
    setTempTime(base);
    setShowTime(true);
  }


  async function shareItem(day: SavedDay, it: PlanItem) {
    try {
      const msg =
        `Venice plan • ${day.dateLabel}\n` +
        `${it.location}\n` +
        `${it.from || '—'}–${it.to || '—'}\n` +
        (it.note ? `Note: ${it.note}` : '');
      await Share.share({ message: msg });
    } catch (e) {
      console.warn('Share failed:', e);
    }
  }
  return (
    <ImageBackground
      source={require('../assets/background.png')}
      style={styles.bg}
      resizeMode="cover"
      onLayout={onLayoutRoot}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.flex, { opacity: fadeAnim }]}>
        {mode === 'empty' && (
          <ScrollView
            contentContainerStyle={[styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={ICONS.crown}
              style={{ width: 70, height: 70, marginBottom: 10 }}
              resizeMode="contain"
            />
            <Text style={[styles.h1, { fontSize: isSmall ? 22 : 24 }]}>Plan Your Days in Venice</Text>

            <View style={[styles.emptyCard, { width: contentW, marginTop: 38 }]}>
              <Text style={styles.emptyText}>
                You haven’t added anything yet.{'\n'}
                Start building your Venice days — one walk, one café, one memory at a time.
              </Text>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.goldBtn, { width: '100%', height: 45 }]}
                onPress={startNewPlanToday}
              >
                <Text style={styles.goldBtnText}>+ Add to Today’s Plan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {mode === 'form' && (
          <ScrollView
            contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.topRow, { width: contentW }]}>
              <TouchableOpacity hitSlop={10} onPress={handleBackFromForm} style={styles.topBackBtn}>
                <Image source={ICONS.back} style={styles.topBackIcon} />
              </TouchableOpacity>

              <Text style={styles.h1}>Today’s Plan</Text>
              <View style={{ width: 44, height: 36 }} />
            </View>

            <View style={[styles.fieldRow, { width: contentW }]}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.input}>
                <Text style={styles.inputText}>{dateLabel}</Text>
                <TouchableOpacity onPress={openDatePicker} hitSlop={8}>
                  <Text style={styles.suffix}>🗓️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ width: contentW }}>
              <Text style={styles.groupTitle}>Plan</Text>

              {items.map((it) => (
                <View key={it.id} style={{ marginBottom: 12 }}>
                  <View style={styles.input}>
                    <TextInput
                      placeholder="Location name"
                      placeholderTextColor="rgba(255,255,255,0.85)"
                      style={styles.inputEdit}
                      value={it.location}
                      onChangeText={t => updateItem(it.id, { location: t })}
                      maxLength={120}
                    />
                    <Text style={styles.suffix}>▾</Text>
                  </View>

                  <View style={styles.row2}>
                    <View style={[styles.input, styles.half]}>
                      <Text style={[styles.inputText, it.from ? null : styles.placeholder]}>
                        {it.from || 'Start Time'}
                      </Text>
                      <TouchableOpacity onPress={() => openTimePicker(it.id, 'from')} hitSlop={8}>
                        <Text style={styles.suffix}>⏰</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.input, styles.half]}>
                      <Text style={[styles.inputText, it.to ? null : styles.placeholder]}>
                        {it.to || 'End Time'}
                      </Text>
                      <TouchableOpacity onPress={() => openTimePicker(it.id, 'to')} hitSlop={8}>
                        <Text style={styles.suffix}>⏰</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.input}>
                    <TextInput
                      placeholder="Write a custom note..."
                      placeholderTextColor="rgba(255,255,255,0.85)"
                      style={styles.inputEdit}
                      value={it.note}
                      onChangeText={t => updateItem(it.id, { note: t })}
                    />
                    <Text style={styles.suffix}>✎</Text>
                  </View>

                  {items.length > 1 && (
                    <TouchableOpacity style={styles.removeLine} onPress={() => removeItem(it.id)}>
                      <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity activeOpacity={0.9} style={styles.addBtn} onPress={addItem}>
                <Text style={{ color: WHITE, fontWeight: '700' }}>⊕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={canSave ? 0.9 : 1}
              disabled={!canSave}
              style={[
                styles.saveBtn,
                { width: contentW, backgroundColor: canSave ? GOLD : 'rgba(255,255,255,0.35)' },
              ]}
              onPress={saveDay}
            >
              <Text style={[styles.saveText, { color: canSave ? '#1C1C1E' : 'rgba(28,28,30,0.7)' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {mode === 'list' && (
          <ScrollView
            contentContainerStyle={{ paddingTop: topPad, paddingBottom: bottomPad, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
          >

            <Image
              source={ICONS.crown}
              style={{ width: 70, height: 70, marginBottom: 6 }}
              resizeMode="contain"
            />
            <Text style={[styles.h1, { marginBottom: 4 }]}>Plan Your Days in Venice</Text>

            {saved.map(day => (
              <View key={day.id} style={[styles.dayCard, { width: contentW }]}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{day.dateLabel}</Text>
                  <TouchableOpacity onPress={() => setAskDelete(day.id)}>
                    <Text style={{ color: GOLD }}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {day.items.map(it => (
                  <View key={it.id} style={styles.dayItem}>
                    <View style={styles.dot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemTitle}>{it.location || 'Place'}</Text>
                      <Text style={styles.itemMeta}>{(it.from || '9:00')} – {(it.to || '12:00')}</Text>
                      {it.note ? <Text style={styles.itemNote}>{it.note}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => shareItem(day, it)} hitSlop={8}>
                      <Text style={{ color: GOLD, fontSize: 16 }}>⤴︎</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {!saved.length && (
              <Text style={{ color: 'rgba(255,255,255,0.9)', marginTop: 12 }}>
                No saved days yet.
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.goldBtn, { width: contentW, height: 45, marginTop: 12 }]}
              onPress={startNewPlanToday}
            >
              <Text style={styles.goldBtnText}>+ Add to Today’s Plan</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Animated.View>

      <Modal visible={askLeave} transparent animationType="fade" onRequestClose={() => setAskLeave(false)}>
        <View style={styles.dim}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Unsaved Changes</Text>
            <Text style={styles.alertText}>
              You have unsaved changes. Are you sure you want to leave without saving?
            </Text>
            <View style={styles.alertRow}>
              <TouchableOpacity style={styles.alertBtn} onPress={() => setAskLeave(false)}>
                <Text style={styles.alertBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, { backgroundColor: GOLD }]}
                onPress={() => {
                  setAskLeave(false);
                  setDirty(false);
                  setItems([]);
                  setMode(saved.length ? 'list' : 'empty');
                }}
              >
                <Text style={[styles.alertBtnText, { color: '#1C1C1E', fontWeight: '700' }]}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!askDelete} transparent animationType="fade" onRequestClose={() => setAskDelete(null)}>
        <View style={styles.dim}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>Delete This Day’s Plan?</Text>
            <Text style={styles.alertText}>
              This will remove all saved notes and places for this day. Are you sure you want to delete everything?
            </Text>
            <View style={styles.alertRow}>
              <TouchableOpacity style={styles.alertBtn} onPress={() => setAskDelete(null)}>
                <Text style={styles.alertBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, { backgroundColor: GOLD }]}
                onPress={() => askDelete && deleteDay(askDelete)}
              >
                <Text style={[styles.alertBtnText, { color: '#1C1C1E', fontWeight: '700' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'ios' ? (
        <Modal visible={showDate} transparent animationType="fade" onRequestClose={cancelDate}>
          <View style={styles.dim}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <View style={styles.pickerInner}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={(_, d) => { if (d) setTempDate(d); }}
                  themeVariant="dark"
                  textColor={WHITE}
                  accentColor={GOLD}
                />
              </View>
              <View style={styles.pickerBtns}>
                <TouchableOpacity style={styles.pickerBtn} onPress={cancelDate}>
                  <Text style={styles.pickerBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pickerBtn, styles.pickerBtnPrimary]} onPress={confirmDate}>
                  <Text style={[styles.pickerBtnText, { color: '#1C1C1E', fontWeight: '700' }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : showDate && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          themeVariant="dark"
        />
      )}

      {Platform.OS === 'ios' ? (
        <Modal visible={showTime} transparent animationType="fade" onRequestClose={cancelTime}>
          <View style={styles.dim}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <View style={styles.pickerInner}>
                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  is24Hour
                  display="spinner"
                  onChange={(_, d) => { if (d) setTempTime(d); }}
                  themeVariant="dark"
                  textColor={WHITE}
                  accentColor={GOLD}
                />
              </View>
              <View style={styles.pickerBtns}>
                <TouchableOpacity style={styles.pickerBtn} onPress={cancelTime}>
                  <Text style={styles.pickerBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pickerBtn, styles.pickerBtnPrimary]} onPress={confirmTime}>
                  <Text style={[styles.pickerBtnText, { color: '#1C1C1E', fontWeight: '700' }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : showTime && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour
          display="default"
          onChange={onTimeChange}
          themeVariant="dark"
        />
      )}
    </ImageBackground>
  );
}


function rid() {
  return Math.random().toString(36).slice(2);
}
function getTodayLabel() {
  const d = new Date();
  return formatDateLabel(d);
}
function parseDateFromLabel(label: string) {
  const [month, rest] = label.split(' ');
  const day = parseInt(rest, 10);
  const year = new Date().getFullYear();
  return new Date(`${month} ${day}, ${year}`);
}
function formatDateLabel(d: Date) {
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', weekday: 'short' };
  return d.toLocaleDateString('en-US', opts).replace(',', ',');
}
function toHHMM(d: Date) {
  const h = `${d.getHours()}`.padStart(2, '0');
  const m = `${d.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 }, 
  centerAll: { alignItems: 'center' },

  h1: { color: WHITE, fontWeight: '700', textAlign: 'center', fontSize: 24 },

  emptyCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { color: 'rgba(255,255,255,0.95)', textAlign: 'center', lineHeight: 22 },

  goldBtn: {
    backgroundColor: GOLD,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnText: { color: '#1C1C1E', fontWeight: '700' },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  topBackBtn: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: ROW_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  topBackIcon: {
    width: 18,
    height: 18,
    tintColor: WHITE,
  },

  fieldRow: { marginBottom: 10 },
  fieldLabel: { color: 'rgba(255,255,255,0.9)', marginBottom: 6 },
  input: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: ROW_BG,
    borderWidth: 1.5,
    borderColor: 'rgba(245,245,245,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: { color: WHITE, flex: 1 },
  inputEdit: { color: WHITE, flex: 1, paddingVertical: 0 },
  placeholder: { color: 'rgba(255,255,255,0.7)' },
  suffix: { color: 'rgba(255,255,255,0.9)', marginLeft: 6 },

  groupTitle: { color: WHITE, fontWeight: '700', marginBottom: 8 },

  row2: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 },
  half: { flex: 1 },

  addBtn: {
    alignSelf: 'center',
    width: 140,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  removeLine: { alignSelf: 'flex-end', paddingVertical: 4 },

  saveBtn: {
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveText: { fontWeight: '700', fontSize: 16 },

  dayCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dayTitle: { color: WHITE, fontWeight: '700' },
  dayItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD, marginTop: 0 },
  itemTitle: { color: WHITE, fontWeight: '700' },
  itemMeta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, marginBottom: 2 },
  itemNote: { color: 'rgba(255,255,255,0.95)' },

  dim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  alertCard: { width: '100%', maxWidth: 340, backgroundColor: 'rgba(101,0,6,0.96)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  alertTitle: { color: WHITE, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  alertText: { color: 'rgba(255,255,255,0.95)', textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  alertRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  alertBtn: { paddingHorizontal: 16, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  alertBtnText: { color: WHITE },

  pickerCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: ROW_BG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pickerTitle: { color: WHITE, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  pickerInner: {
    backgroundColor: ROW_BG,
    borderRadius: 12,
    paddingVertical: Platform.OS === 'ios' ? 6 : 0,
    alignItems: 'center',
  },
  pickerBtns: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 10 },
  pickerBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pickerBtnPrimary: { backgroundColor: GOLD },
  pickerBtnText: { color: WHITE, fontWeight: '600' },
});