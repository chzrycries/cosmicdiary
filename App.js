import React, { useState, useEffect, useRef} from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Image, Alert, SafeAreaView, Modal,
  KeyboardAvoidingView, Platform, Linking
} from 'react-native';
import Svg, { Defs, Circle, Rect, Mask, RadialGradient, Stop, LinearGradient } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');
const MOOD_EMOJIS = ['😀','😊','😐','😢','😡','🥰','😴','🤩','😎','🤔','😱','🥳'];
function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}
function parseLinearGradient(str) {
  // Example: 'linear-gradient(90deg,#a685e2,#f6e58d)'
  const match = str.match(/linear-gradient\(.*?,(.*)\)/);
  if (match) {
    return match[1].split(',').map(s => s.trim());
  }
  return ['#a685e2', '#f6e58d'];
}
function createStar(i, cosmic) {
  return {
    id: i + '-' + Math.random(),
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    size: randomBetween(1, cosmic ? 4 : 2),
    baseGlow: randomBetween(cosmic ? 0.5 : 0.3, cosmic ? 1 : 0.8),
    driftX: randomBetween(-0.05, 0.05),
    driftY: randomBetween(0.01, 0.08),
    twinkleSpeed: randomBetween(1.2, 2.5),
    twinklePhase: randomBetween(0, Math.PI * 2),
    glow: 1,
  };
}
const themes = {
 light: {
  container: { flex: 1, backgroundColor: '#fff' },
  text: { color: '#232946' },
  input: {
    backgroundColor: '#fff', 
    color: '#232946',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  entryCard: {
    backgroundColor: '#fff', 
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#a685e2',
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  icon: { color: '#232946' },
  menuBg: { backgroundColor: '#fff' }, 
  button: {
    background: '#f6e58d',
    text: '#232946',
    shadow: '#a685e2'
  },
  buttonAlt: {
    background: '#a685e2',
    text: '#fff',
    shadow: '#f6e58d'
  },
  modalBg: '#fff', 
  modalText: '#232946',
  border: '#e0e0e0',
  link: { color: '#3a86ff' },
  gradient: ['#fff', '#fff'], 
  fab: '#f6e58d',
  fabIcon: '#232946'
  },
  dark: {
    container: { flex: 1, backgroundColor: '#181826' },
    text: { color: '#e0e0e0' },
    input: {
      backgroundColor: '#232946',
      color: '#e0e0e0',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#393a5a',
    },
    entryCard: {
      backgroundColor: '#232946',
      borderRadius: 16,
      padding: 16,
      marginVertical: 8,
      shadowColor: '#a685e2',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: '#393a5a',
    },
    icon: { color: '#f6e58d' },
    menuBg: { backgroundColor: '#232946' },
    button: {
      background: '#232946',
      text: '#f6e58d',
      shadow: '#a685e2'
    },
    buttonAlt: {
      background: '#f6e58d',
      text: '#232946',
      shadow: '#393a5a'
    },
    modalBg: '#232946',
    modalText: '#fffbe6',
    border: '#393a5a',
    link: { color: '#5ad1e6' },
    gradient: ['#232946', '#393a5a'],
    fab: '#232946',
    fabIcon: '#f6e58d'
  },
  cosmic: {
    container: { flex: 1, backgroundColor: '#0b0033' },
    text: { color: '#dcd6f7' },
    input: {
      backgroundColor: '#1a124d',
      color: '#fffbe6',
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#a685e2',
    },
    entryCard: {
      backgroundColor: 'rgba(35,41,70,0.97)',
      borderRadius: 16,
      padding: 16,
      marginVertical: 8,
      shadowColor: '#a685e2',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 12,
      elevation: 6,
      borderWidth: 1,
      borderColor: '#a685e2',
    },
    icon: { color: '#f6e58d' },
    menuBg: { backgroundColor: 'rgba(35,41,70,0.92)' },
    button: {
      background: 'linear-gradient(90deg,#a685e2,#f6e58d)',
      text: '#232946',
      shadow: '#fffbe6'
    },
    buttonAlt: {
      background: '#232946',
      text: '#f6e58d',
      shadow: '#a685e2'
    },
    modalBg: 'rgba(20,10,60,0.97)',
    modalText: '#fffbe6',
    border: '#a685e2',
    link: { color: '#a685e2' },
    gradient: ['#181826', '#a685e2', '#f6e58d'],
    fab: '#a685e2',
    fabIcon: '#fffbe6'
  },

  cosmic: {
    container: { flex: 1, backgroundColor: '#0b0033' },
    text: { color: '#dcd6f7' },
    input: { backgroundColor: '#1a124d', color: '#fffbe6', borderRadius: 8, padding: 10, fontSize: 16 },
    entryCard: { backgroundColor: 'rgba(35,41,70,0.97)', borderRadius: 16, padding: 16, marginVertical: 8, shadowColor: '#a685e2', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 2 }, shadowRadius: 12, elevation: 6 },
    icon: { color: '#f6e58d' },
    menuBg: { backgroundColor: 'rgba(35,41,70,0.92)' },
    button: { background: 'linear-gradient(90deg,#a685e2,#f6e58d)', text: '#232946', shadow: '#fffbe6' },
    buttonAlt: { background: '#232946', text: '#f6e58d', shadow: '#a685e2' },
    modalBg: 'rgba(20,10,60,0.97)',
    modalText: '#fffbe6',
    border: '#a685e2',
    link: { color: '#a685e2' },
    gradient: ['#181826', '#a685e2', '#f6e58d'],
    fab: '#a685e2',
    fabIcon: '#fffbe6'
  },
};

// --- BUTTON ---
const BUTTON_HEIGHT = 54;

const CosmicButton = ({
  title,
  onPress,
  theme = "cosmic",
  style = {},
  icon = null,
  solid = false, 
}) => {
  const btnTheme = themes[theme]?.button || themes.cosmic.button;
  const isCosmic = theme === "cosmic";
  let gradientColors = [];
  if (isCosmic && btnTheme.background.startsWith('linear-gradient')) {
    gradientColors = parseLinearGradient(btnTheme.background);
  }

  const [btnWidth, setBtnWidth] = useState(200);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 10,
          overflow: 'hidden',
          elevation: 8,
          shadowColor: btnTheme.shadow,
          shadowOpacity: 0.4,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 12,
          minWidth: 180,
          height: BUTTON_HEIGHT,
        },
        style,
      ]}
      activeOpacity={0.85}
      onLayout={e => setBtnWidth(e.nativeEvent.layout.width)}
    >
      {(isCosmic && !solid) ? (
        <Svg
          width={btnWidth}
          height={BUTTON_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Defs>
            <LinearGradient id="cosmicBtnGradient" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={gradientColors[0] || "#a685e2"} />
              <Stop offset="100%" stopColor={gradientColors[1] || "#f6e58d"} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={btnWidth}
            height={BUTTON_HEIGHT}
            rx="16"
            fill="url(#cosmicBtnGradient)"
          />
        </Svg>
      ) : (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: isCosmic
              ? (themes.cosmic.buttonAlt?.background || "#a685e2")
              : btnTheme.background,
            borderRadius: 16,
          }}
          pointerEvents="none"
        />
      )}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: BUTTON_HEIGHT,
        justifyContent: 'center',
        paddingHorizontal: 28,
      }}>
        {icon && <Text style={{ fontSize: 24, marginRight: 10 }}>{icon}</Text>}
        <Text style={{
          color: btnTheme.text,
          fontWeight: 'bold',
          fontSize: 18,
          letterSpacing: 0.5,
          textShadowColor: (isCosmic && !solid) ? "#fffbe6" : undefined,
          textShadowRadius: (isCosmic && !solid) ? 6 : 0,
        }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// background stars
const StarField = ({ count = 60, cosmic = false }) => {
  const starsRef = useRef(
    Array.from({ length: count }).map((_, i) => createStar(i, cosmic))
  );
  const [, setFrame] = useState(0);

  useEffect(() => {
    let running = true;
    function animate() {
      const now = Date.now() / 1000;
      starsRef.current.forEach(star => {
        star.glow =
          star.baseGlow *
          (0.7 +
            0.3 *
              Math.sin(
                now * star.twinkleSpeed + star.twinklePhase
              ));
        star.x += star.driftX;
        star.y += star.driftY;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y > height) star.y = 0;
      });
      setFrame(f => f + 1);
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {starsRef.current.map(star => (
        <View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: cosmic ? '#fffbe6' : '#fffbe6',
            opacity: star.glow,
            shadowColor: cosmic ? '#a685e2' : '#fffbe6',
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: cosmic ? 8 : 2,
          }}
        />
      ))}
    </View>
  );
};

// -- INTRO --
function IntroScreen({ onContinue, theme }) {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: themes[theme].container.backgroundColor,
    }}>
      {theme === "cosmic" && (
        <>
          <StarField count={90} cosmic />
          <Svg height={190} width={width} style={{ position: 'absolute', top: 60, left: 0 }}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#a685e2" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#0b0033" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx={width * 0.7} cy={60} r={45} fill="#f6e58d" />
            <Circle cx={width * 0.7} cy={60} r={70} fill="url(#glow)" />
            <Circle cx={width * 0.25} cy={110} r={32} fill="#fffbe6" opacity={0.8} />
            <Circle cx={width * 0.25 + 12} cy={110} r={32} fill="#a685e2" opacity={0.4} />
          </Svg>
        </>
      )}
      {theme === "dark" && (
        <Svg height={200} width={width} style={{ position: 'absolute', top: 40, left: 0 }}>
          <Defs>
            <RadialGradient id="darkglow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#393a5a" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#181826" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={width * 0.7} cy={60} r={55} fill="#232946" />
          <Circle cx={width * 0.7} cy={60} r={90} fill="url(#darkglow)" />
        </Svg>
      )}
      {theme === "light" && (
  <Svg height={170} width={width} style={{ position: 'absolute', top: 40, left: 0 }}>
    <Defs>
      <RadialGradient id="whiteSunGlow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
        <Stop offset="70%" stopColor="#f6e58d" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </RadialGradient>
    </Defs>
    <Circle
      cx={width * 0.7}
      cy={60}
      r={48}
      fill="#fff"
      stroke="#f6e58d"
      strokeWidth={3}
      opacity={0.98}
    />
    <Circle
      cx={width * 0.7}
      cy={60}
      r={80}
      fill="url(#whiteSunGlow)"
      opacity={0.95}
    />
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * Math.PI * 2) / 12;
      const x1 = width * 0.7 + Math.cos(angle) * 58;
      const y1 = 60 + Math.sin(angle) * 58;
      const x2 = width * 0.7 + Math.cos(angle) * 70;
      const y2 = 60 + Math.sin(angle) * 70;
      return (
        <Rect
          key={i}
          x={x1 - 2}
          y={y1 - 8}
          width={4}
          height={16}
          rx={2}
          fill="#f6e58d"
          opacity={0.8}
          transform={`rotate(${(angle * 180) / Math.PI} ${x1} ${y1})`}
        />
      );
    })}
  </Svg>
)}
      <Text style={{
        fontSize: 36,
        fontWeight: 'bold',
        color: theme === "cosmic" ? "#f6e58d" : themes[theme].text.color,
        marginBottom: 12,
        letterSpacing: 2,
        textShadowColor: theme === "cosmic" ? "#a685e2" : undefined,
        textShadowRadius: theme === "cosmic" ? 12 : 0,
        textShadowOffset: { width: 0, height: 3 },
      }}>
        {theme === "cosmic" ? "🌌" : theme === "dark" ? "🌙" : "🌞"} Cosmic Diary
      </Text>
      <Text style={{
        fontSize: 18,
        color: theme === "cosmic" ? "#fffbe6" : themes[theme].text.color,
        textAlign: 'center',
        marginBottom: 32,
        marginTop: 12,
        opacity: 0.92,
      }}>
        Capture your thoughts, moods, and memories in a cosmic way!
      </Text>
      <CosmicButton
        title="Get Started"
        onPress={onContinue}
        theme={theme}
        icon="🚀"
        style={{ minWidth: 180, marginTop: 12 }}
      />
    </View>
  );
}

// --- MEDIA MODAL ---
function MediaModal({ visible, uri, type, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <TouchableOpacity style={{ position: 'absolute', top: 40, right: 30, zIndex: 10 }} onPress={onClose}>
          <Text style={{ fontSize: 32, color: "#fff", fontWeight: "bold" }}>✖️</Text>
        </TouchableOpacity>
        {type === "image" && (
          <Image source={{ uri }} style={{ width: width * 0.9, height: height * 0.6, borderRadius: 18, resizeMode: "contain" }} />
        )}
        {type === "video" && (
          <Video
            source={{ uri }}
            style={{ width: width * 0.9, height: height * 0.6, borderRadius: 18 }}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
        )}
        {type === "audio" && (
          <AudioPlayer uri={uri} big />
        )}
      </View>
    </Modal>
  );
}

// --- AUDIO PLAYER ---
function AudioPlayer({ uri, big }) {
  const [sound, setSound] = useState();
  const [playing, setPlaying] = useState(false);

  const play = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      setPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlaying(false);
          setSound(null);
        }
      });
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  };
  const pause = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlaying(false);
    }
  };
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);
  return (
    <TouchableOpacity onPress={playing ? pause : play} style={{ marginRight: 8, alignItems: "center" }}>
      <Text style={{ fontSize: big ? 48 : 22, color: "#f6e58d" }}>{playing ? '⏸️' : '▶️'}</Text>
      {big && <Text style={{ color: "#fff", marginTop: 8, fontSize: 18 }}>Tap to {playing ? "pause" : "play"}</Text>}
    </TouchableOpacity>
  );
}

// --- MOON SVG ---
function MoonPhaseSVG({ phase = 0, size = 28, theme = "light" }) {
  const themeMoon = {
    light: {
      moon: "#fffbe6",
      highlight: "#f6e58d",
      outline: "#e1c340",
      glow: "#f6e58d",
    },
    dark: {
      moon: "#f6e58d",
      highlight: "#fffbe6",
      outline: "#e1c340",
      glow: "#a685e2",
    },
    cosmic: {
      moon: "#fffbe6",
      highlight: "#f6e58d",
      outline: "#a685e2",
      glow: "#a685e2",
    },
  }[theme] || {
    moon: "#fffbe6",
    highlight: "#f6e58d",
    outline: "#e1c340",
    glow: "#f6e58d",
  };

  const radius = size / 2;
  const offsets = [1, 0.6, 0.2, -0.2, -1, -0.6, -0.2, 0.2];
  const shadowOffset = offsets[phase % 8] * radius;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={themeMoon.glow} stopOpacity="0.38" />
          <Stop offset="80%" stopColor={themeMoon.glow} stopOpacity="0.0" />
        </RadialGradient>
        <Mask id="moonMask">
          <Rect width={size} height={size} fill="white" />
          <Circle
            cx={radius + shadowOffset}
            cy={radius}
            r={radius}
            fill="black"
          />
        </Mask>
      </Defs>
      <Circle
        cx={radius}
        cy={radius}
        r={radius}
        fill="url(#moonGlow)"
        opacity={0.7}
      />
      <Circle cx={radius} cy={radius} r={radius} fill={themeMoon.moon} />
      <Circle
        cx={radius}
        cy={radius}
        r={radius}
        fill={themeMoon.highlight}
        mask="url(#moonMask)"
        opacity={0.97}
      />
      <Circle
        cx={radius}
        cy={radius}
        r={radius - 1.2}
        fill="none"
        stroke={themeMoon.outline}
        strokeWidth={2}
        opacity={0.7}
      />
    </Svg>
  );
}

// --- CALENDAR HELPERS ---
function getMonthDays(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
function getMoonPhase(date) {
  const lp = 2551443;
  const now = date.getTime() / 1000;
  const new_moon = new Date(1970, 0, 7, 20, 35, 0).getTime() / 1000;
  const phase = ((now - new_moon) % lp) / (lp / 8);
  return Math.floor(phase) % 8;
}

// --- CALENDAR STRIP ---
function CalendarStrip({ selectedDate, setSelectedDate, themeStyle, entries }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const days = getMonthDays(currentYear, currentMonth);
  const entryDates = new Set(entries.map(e => (new Date(e.date)).toDateString()));

  return (
    <View style={[styles.calendarStrip, { backgroundColor: themeStyle.menuBg.backgroundColor }]}>
      <View style={styles.calendarHeaderRow}>
        <TouchableOpacity onPress={() => {
          if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
          } else {
            setCurrentMonth(currentMonth - 1);
          }
        }}>
          <Text style={{ fontSize: 22, color: themeStyle.icon.color }}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.calendarMonthText, themeStyle.text]}>
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </Text>
        <TouchableOpacity onPress={() => {
          if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
          } else {
            setCurrentMonth(currentMonth + 1);
          }
        }}>
          <Text style={{ fontSize: 22, color: themeStyle.icon.color }}>›</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
        {days.map((date, i) => {
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const hasEntry = entryDates.has(date.toDateString());
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedDate(new Date(date))}
              style={[
                styles.calendarDay,
                isSelected && { backgroundColor: '#f6e58d' },
              ]}
            >
              <Text style={{
                color: isSelected ? '#232946' : themeStyle.text.color,
                fontWeight: isSelected ? 'bold' : 'normal',
                fontSize: 15,
              }}>
                {date.getDate()}
              </Text>
              <MoonPhaseSVG phase={getMoonPhase(date)} size={20} />
              {hasEntry && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --- SETTINGS ---
function SettingsModal({ visible, onClose, theme, setTheme }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.settingsModalOverlay}>
        <View style={styles.settingsModalCard}>
          <Text style={{ color: '#fffbe6', fontSize: 22, fontWeight: 'bold', marginBottom: 20, alignSelf: 'center' }}>
            Settings
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#dcd6f7', fontSize: 16, marginBottom: 8 }}>Theme:</Text>
              {['cosmic', 'dark', 'light'].map(t => (
                <TouchableOpacity
                  key={t}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: theme === t ? '#393a5a' : 'transparent',
                    marginBottom: 8,
                  }}
                  onPress={() => setTheme(t)}
                >
                  <Text style={{ color: '#fffbe6', fontWeight: theme === t ? 'bold' : 'normal' }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <CosmicButton
            title="Close"
            onPress={onClose}
            theme={theme}
            icon="✖️"
            style={{ alignSelf: "center", minWidth: 120 }}
          />
        </View>
      </View>
    </Modal>
  );
}

// --- ALL ENTRIES MODAL ---
function AllEntriesModal({ visible, onClose, entries, themeStyle, onSelectEntry }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.settingsModalOverlay}>
        <View style={[styles.settingsModalCard, { maxHeight: height * 0.8 }]}>
          <Text style={{
            color: themeStyle.text.color,
            fontSize: 22,
            fontWeight: 'bold',
            marginBottom: 16,
            alignSelf: 'center'
          }}>All Diary Entries</Text>
          <ScrollView>
            {entries.length === 0 && (
              <Text style={[themeStyle.text, { textAlign: 'center', marginTop: 40, fontSize: 18, opacity: 0.7 }]}>
                No entries yet.
              </Text>
            )}
            {entries.slice().reverse().map(entry => (
              <TouchableOpacity
                key={entry.id}
                style={[themeStyle.entryCard, { marginBottom: 10 }]}
                onPress={() => {
                  onSelectEntry(entry);
                  onClose();
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>{entry.mood || '📝'}</Text>
                  <Text style={[themeStyle.text, { fontSize: 18, fontWeight: 'bold' }]}>{entry.title || 'Untitled'}</Text>
                </View>
                <Text style={[themeStyle.text, { opacity: 0.7 }]} numberOfLines={2}>
                  {entry.text}
                </Text>
                <Text style={[themeStyle.text, { fontSize: 12, marginTop: 8, opacity: 0.5 }]}>
                  {new Date(entry.date).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <CosmicButton
            title="Close"
            onPress={onClose}
            theme="cosmic"
            icon="✖️"
            style={{ alignSelf: "center", minWidth: 120 }}
          />
        </View>
      </View>
    </Modal>
  );
}

// --- MOOD PICKER ---
function MoodPicker({ mood, setMood }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
      {MOOD_EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => setMood(emoji)}
          style={{
            marginHorizontal: 4,
            padding: 6,
            borderRadius: 20,
            backgroundColor: mood === emoji ? '#f6e58d' : 'transparent',
          }}
        >
          <Text style={{ fontSize: 26 }}>{emoji}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// --- ENTRY MODAL ---
function EntryModal({
  visible, date, entry, onSave, onClose, themeStyle,
}) {
  const [title, setTitle] = useState(entry?.title || '');
  const [text, setText] = useState(entry?.text || '');
  const [photos, setPhotos] = useState(entry?.photos || []);
  const [videos, setVideos] = useState(entry?.videos || []);
  const [audioRecordings, setAudioRecordings] = useState(entry?.audioRecordings || []);
  const [links, setLinks] = useState(entry?.links || []);
  const [mood, setMood] = useState(entry?.mood || null);
  const [recording, setRecording] = useState(null);
  const [mediaModal, setMediaModal] = useState({ visible: false, uri: null, type: null });

  useEffect(() => {
    setTitle(entry?.title || '');
    setText(entry?.text || '');
    setPhotos(entry?.photos || []);
    setVideos(entry?.videos || []);
    setAudioRecordings(entry?.audioRecordings || []);
    setLinks(entry?.links || []);
    setMood(entry?.mood || null);
  }, [entry, date, visible]);

  const pickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setVideos([...videos, result.assets[0].uri]);
    }
  };
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert('Could not start recording', err.message);
    }
  };
  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioRecordings([...audioRecordings, uri]);
    setRecording(null);
  };
  const addLink = () => {
    Alert.prompt(
      'Add Link',
      'Paste your link below:',
      (url) => {
        if (url) setLinks([...links, url]);
      }
    );
  };

  const handleSave = () => {
    onSave({
      title,
      text,
      photos,
      videos,
      audioRecordings,
      links,
      mood,
    });
  };

  const openMedia = (uri, type) => setMediaModal({ visible: true, uri, type });

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
          <View style={styles.modalCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <CosmicButton
                title="Cancel"
                onPress={onClose}
                theme="dark"
                icon="❌"
                style={{ flex: 1, marginRight: 8, minWidth: 90, paddingVertical: 10 }}
              />
              <CosmicButton
                title="Save"
                onPress={handleSave}
                theme="cosmic"
                icon="💾"
                style={{ flex: 1, marginLeft: 8, minWidth: 90, paddingVertical: 10 }}
              />
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.dateText}>{date ? date.toDateString() : ''}</Text>
              <MoodPicker mood={mood} setMood={setMood} />
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor="#b8c1ec"
                value={title}
                onChangeText={setTitle}
                maxLength={60}
              />
              <TextInput
                style={styles.contentInput}
                multiline
                placeholder="Note"
                placeholderTextColor="#b8c1ec"
                value={text}
                onChangeText={setText}
              />
              <ScrollView horizontal style={{ marginVertical: 8 }}>
                {photos.map((uri, idx) => (
                  <TouchableOpacity key={idx} style={styles.mediaPreview}
                    onPress={() => openMedia(uri, "image")}>
                    <Image source={{ uri }} style={styles.mediaImage} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
                {videos.map((uri, idx) => (
                  <TouchableOpacity key={idx} style={styles.mediaPreview}
                    onPress={() => openMedia(uri, "video")}>
                    <Video source={{ uri }} style={styles.mediaImage} useNativeControls resizeMode="cover" />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => setVideos(videos.filter((_, i) => i !== idx))}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView horizontal style={{ marginBottom: 8 }}>
                {audioRecordings.map((uri, idx) => (
                  <TouchableOpacity key={idx} style={styles.audioPreview}
                    onPress={() => openMedia(uri, "audio")}>
                    <AudioPlayer uri={uri} />
                    <TouchableOpacity style={styles.removeBtn} onPress={() => setAudioRecordings(audioRecordings.filter((_, i) => i !== idx))}>
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                {links.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.linkChip}
                    onPress={() => Linking.openURL(url.startsWith('http') ? url : `https://${url}`)}
                  >
                    <Text style={{ color: '#5ad1e6', textDecorationLine: 'underline' }}>{url}</Text>
                    <TouchableOpacity onPress={() => setLinks(links.filter((_, i) => i !== idx))}>
                      <Text style={{ color: '#5ad1e6', marginLeft: 4 }}>×</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={styles.fabRow}>
              <TouchableOpacity style={styles.fab} onPress={pickPhoto}>
                <Text style={styles.fabIcon}>🖼️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fab} onPress={pickVideo}>
                <Text style={styles.fabIcon}>🎬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fab} onPress={recording ? stopRecording : startRecording}>
                <Text style={styles.fabIcon}>{recording ? '⏹️' : '🎤'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fab} onPress={addLink}>
                <Text style={styles.fabIcon}>🔗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <MediaModal
        visible={mediaModal.visible}
        uri={mediaModal.uri}
        type={mediaModal.type}
        onClose={() => setMediaModal({ visible: false, uri: null, type: null })}
      />
    </>
  );
}

// --- MAIN APP ---
export default function App() {
  const [theme, setTheme] = useState('cosmic');
  const [showSettings, setShowSettings] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [intro, setIntro] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllEntries, setShowAllEntries] = useState(false);

  const themeStyle = themes[theme];

  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem('cosmic_theme');
      if (savedTheme) setTheme(savedTheme);
      const savedEntries = await AsyncStorage.getItem('cosmic_entries');
      if (savedEntries) setEntries(JSON.parse(savedEntries));
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('cosmic_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    AsyncStorage.setItem('cosmic_theme', theme);
  }, [theme]);

  const handleSaveEntry = (entryData) => {
    if (selectedEntry?.id != null) {
      setEntries(entries.map(e => e.id === selectedEntry.id ? { ...e, ...entryData } : e));
    } else {
      setEntries([
        ...entries,
        {
          ...entryData,
          id: Date.now(),
          date: selectedDate.toISOString(),
        }
      ]);
    }
    setShowEntryModal(false);
    setSelectedEntry(null);
  };

  const filteredEntries = entries.filter(e =>
    (new Date(e.date)).toDateString() === selectedDate.toDateString()
  );

  if (intro) return <IntroScreen onContinue={() => setIntro(false)} theme={theme} />;

  return (
    <SafeAreaView style={[themeStyle.container, { flex: 1 }]}>
      <StarField count={theme === "cosmic" ? 80 : 40} cosmic={theme === "cosmic"} />
      <View style={{ height: 18 }} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
          <Text style={{ fontSize: 26, color: themeStyle.icon.color }}>⚙️</Text>
        </TouchableOpacity>
        <Text style={[styles.headerText, themeStyle.text]}>Cosmic Diary</Text>
        <TouchableOpacity onPress={() => setShowAllEntries(true)} style={styles.iconBtn}>
          <Text style={{ fontSize: 26, color: themeStyle.icon.color }}>📚</Text>
        </TouchableOpacity>
      </View>
      <CalendarStrip
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        themeStyle={themeStyle}
        entries={entries}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {filteredEntries.length === 0 && (
          <Text style={[themeStyle.text, { textAlign: 'center', marginTop: 40, fontSize: 18, opacity: 0.7 }]}>
            No entries for this day. Tap "+" to add a diary entry!
          </Text>
        )}
        {filteredEntries.slice().reverse().map(entry => (
          <TouchableOpacity
            key={entry.id}
            style={[themeStyle.entryCard, { marginBottom: 10 }]}
            onPress={() => {
              setSelectedEntry(entry);
              setShowEntryModal(true);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 22, marginRight: 8 }}>{entry.mood || '📝'}</Text>
              <Text style={[themeStyle.text, { fontSize: 18, fontWeight: 'bold' }]}>{entry.title || 'Untitled'}</Text>
            </View>
            <Text style={[themeStyle.text, { opacity: 0.7 }]} numberOfLines={2}>
              {entry.text}
            </Text>
            <Text style={[themeStyle.text, { fontSize: 12, marginTop: 8, opacity: 0.5 }]}>
              {new Date(entry.date).toLocaleString()}
            </Text>
            <ScrollView horizontal style={{ marginTop: 8 }}>
              {entry.photos && entry.photos.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.thumb} />
              ))}
              {entry.videos && entry.videos.map((uri, idx) => (
                <View key={idx} style={styles.thumb}><Video source={{ uri }} style={styles.thumb} /></View>
              ))}
              {entry.audioRecordings && entry.audioRecordings.map((uri, idx) => (
                <View key={idx} style={[styles.thumb, { justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ fontSize: 18, color: "#f6e58d" }}>🎤</Text>
                </View>
              ))}
            </ScrollView>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.fabMain, { backgroundColor: themeStyle.fab }]}
        onPress={() => {
          setSelectedEntry(null);
          setShowEntryModal(true);
        }}
      >
        <Text style={[styles.fabMainIcon, { color: themeStyle.fabIcon }]}>＋</Text>
      </TouchableOpacity>
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        setTheme={setTheme}
      />
      <AllEntriesModal
        visible={showAllEntries}
        onClose={() => setShowAllEntries(false)}
        entries={entries}
        themeStyle={themeStyle}
        onSelectEntry={entry => {
          setSelectedEntry(entry);
          setShowEntryModal(true);
        }}
      />
      <EntryModal
        visible={showEntryModal}
        date={selectedEntry ? new Date(selectedEntry.date) : selectedDate}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        onClose={() => {
          setShowEntryModal(false);
          setSelectedEntry(null);
        }}
        themeStyle={themeStyle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(35,41,70,0.18)',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  iconBtn: {
    padding: 6,
    marginHorizontal: 2,
  },
  calendarStrip: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#393a5a',
    backgroundColor: '#232946',
    zIndex: 1,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 2,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 36,
    minHeight: 48,
    position: 'relative',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f6e58d',
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -3,
  },
  fabMain: {
    position: 'absolute',
    right: 26,
    bottom: 36,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fffbe6',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 18,
    elevation: 12,
    zIndex: 10,
  },
  fabMainIcon: {
    fontSize: 38,
    fontWeight: 'bold',
    textShadowColor: '#a685e2',
    textShadowRadius: 8,
  },
  modalCard: {
    width: width * 0.92,
    minHeight: height * 0.6,
    backgroundColor: '#232946',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.19,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 18,
    elevation: 10,
    marginTop: 40,
  },
  dateText: {
    color: '#fffbe6',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  titleInput: {
    backgroundColor: '#393a5a',
    color: '#fffbe6',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 4,
  },
  contentInput: {
    backgroundColor: '#393a5a',
    color: '#dcd6f7',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 8,
  },
  mediaPreview: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#181826',
    justifyContent: "center",
    alignItems: "center"
  },
  mediaImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#393a5a',
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#393a5a',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232946',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  thumb: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 4,
    backgroundColor: '#393a5a',
  },
  fabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  fab: {
    backgroundColor: '#393a5a',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  fabIcon: {
    fontSize: 22,
    color: '#f6e58d',
  },
  settingsModalOverlay: {
    flex:1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center'
  },
  settingsModalCard: {
    backgroundColor: '#232946',
    borderRadius:16,
    padding: 24,
    width: width * 0.88,
  },
});
