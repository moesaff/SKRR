import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Dimensions, Animated, Easing, Image, Modal, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - 48;
export const CARD_HEIGHT = CARD_WIDTH * 1.55;

// ── Card style options ────────────────────────────────────────────────────────

export const CARD_BACKGROUNDS = [
  { id: 'original', label: 'Original', color: '#0D0D1F' },
  { id: 'black',    label: 'Black',    color: '#000000' },
  { id: 'white',    label: 'White',    color: '#F5F5F5' },
];

export const OUTLINE_COLORS = [
  { id: 'pink',   color: '#FF0080' },
  { id: 'cyan',   color: '#00F5FF' },
  { id: 'green',  color: '#00FF88' },
  { id: 'purple', color: '#9B00FF' },
  { id: 'orange', color: '#FF6B00' },
  { id: 'gold',   color: '#FFD700' },
  { id: 'red',    color: '#FF0000' },
  { id: 'black',  color: '#111111' },
  { id: 'white',  color: '#FFFFFF' },
];

export const AURA_OPTIONS: { id: string; label: string; color: string; icon: string }[] = [];


// ── Background textures ───────────────────────────────────────────────────────

function CardBgTexture({ backgroundId }: { backgroundId: string }) {
  if (backgroundId === 'carbon') {
    return (
      <LinearGradient
        colors={['#0A0A0A', '#1C1C1C', '#0D0D0D', '#222222', '#080808']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  if (backgroundId === 'platinum') {
    return (
      <LinearGradient
        colors={['#6E7A80', '#B0BEC5', '#CFD8DC', '#90A4AE', '#546E7A', '#B0BEC5', '#ECEFF1']}
        locations={[0, 0.15, 0.35, 0.5, 0.65, 0.82, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  if (backgroundId === 'gold') {
    return (
      <LinearGradient
        colors={['#7A5500', '#C9941A', '#F0D060', '#D4A017', '#8B6200', '#D4AF37', '#F5E070']}
        locations={[0, 0.15, 0.35, 0.5, 0.65, 0.82, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CardData {
  id: string;
  skrrId?: string;
  username: string;
  location: string;
  profilePhoto?: string | null;
  car: {
    year: number;
    make: string;
    model: string;
    photo?: string | null;
    hp: number;
    torque: number;
    mods: string[];
    zeroToSixty: string;
    drivetrain: string;
    engine: string;
  };
  stats: {
    meetsAttended: number;
    meetsHosted: number;
    friends: number;
    rating: number;
  };
  rank: string;
  cardStyle?: {
    background: string;
    outlineColor: string;
    aura: string;
  };
}

// ── Full-card aura effects ────────────────────────────────────────────────────
// Each aura is an absoluteFill layer rendered between the card background
// and the card content. overflow:hidden on the card clips everything cleanly.

// ── DARK MATTER ───────────────────────────────────────────────────────────────
function DarkMatterAura() {
  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}>
      <LottieView
        source={require('../assets/Looping Energy Orb.json')}
        autoPlay
        loop
        style={{
          position: 'absolute',
          width: CARD_WIDTH * 1.8,
          height: CARD_WIDTH * 1.8,
          top: CARD_HEIGHT / 2 - CARD_WIDTH * 0.9,
          left: CARD_WIDTH / 2 - CARD_WIDTH * 0.9,
        }}
        resizeMode="cover"
      />
      {/* Dark overlay — keeps text readable */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(4,0,12,0.35)' }]} />
    </View>
  );
}

function SynthwaveAuraCard() {
  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}>
      <LottieView
        source={require('../assets/Gradient Dots Background.json')}
        autoPlay
        loop
        style={{ position: 'absolute', width: CARD_WIDTH, height: CARD_HEIGHT }}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(10,0,20,0.30)' }]} />
    </View>
  );
}

function CardAuraEffect({ aura }: { aura: string }) {
  if (aura === 'midnight_purple') return <DarkMatterAura />;
  if (aura === 'miami_pink')      return <SynthwaveAuraCard />;
  return null;
}

// ── Legacy per-avatar components (kept until each is rebuilt as full-card) ────
function UltraParticle({ angle, delay, color }: { angle: number; delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dur = 1400 + (angle * 7.3) % 700;
    const loop = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.delay(200 + delay % 400),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])),
    ]);
    loop.start();
    return () => loop.stop();
  }, []);
  const rad = (angle * Math.PI) / 180;
  return (
    <Animated.View style={{
      position: 'absolute',
      width: 4, height: 4, borderRadius: 2,
      backgroundColor: color,
      left: 44 + Math.cos(rad) * 42 - 2,
      top: 44 + Math.sin(rad) * 42 - 2,
      opacity: anim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 0.4, 0] }),
      transform: [
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(rad) * 30] }) },
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(rad) * 30] }) },
        { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1.2, 0.1] }) },
      ],
    }} />
  );
}

function UltraInstinctAura() {
  // 4 energy rings with non-harmonic durations — never fully syncs = unpredictable
  const e1 = useRef(new Animated.Value(0)).current;
  const e2 = useRef(new Animated.Value(0)).current;
  const e3 = useRef(new Animated.Value(0)).current;
  const e4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const make = (v: Animated.Value, delay: number, upDur: number, downDur: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: upDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.05, duration: downDur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])),
      ]);
    const a1 = make(e1, 0,   730, 890);
    const a2 = make(e2, 340, 1100, 670);
    const a3 = make(e3, 820, 560, 1030);
    const a4 = make(e4, 180, 1450, 940);
    a1.start(); a2.start(); a3.start(); a4.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); a4.stop(); };
  }, []);

  const PARTICLES = [
    { angle: 0,   color: '#9B00FF', delay: 0   },
    { angle: 45,  color: '#4455FF', delay: 200 },
    { angle: 90,  color: '#CC44FF', delay: 400 },
    { angle: 135, color: '#4455FF', delay: 600 },
    { angle: 180, color: '#9B00FF', delay: 150 },
    { angle: 225, color: '#CC44FF', delay: 350 },
    { angle: 270, color: '#4455FF', delay: 550 },
    { angle: 315, color: '#9B00FF', delay: 100 },
  ];

  return (
    <>
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 2.5, borderColor: '#9B00FF', opacity: e1, transform: [{ scale: e1.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.12] }) }] }} />
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 1.5, borderColor: '#4455FF', opacity: e2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }), transform: [{ scale: e2.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.24] }) }] }} />
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 3, borderColor: '#6600CC', opacity: e3.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }), transform: [{ scale: e3.interpolate({ inputRange: [0, 1], outputRange: [1.16, 1.34] }) }] }} />
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 1, borderColor: '#BB88FF', opacity: e4.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }), transform: [{ scale: e4.interpolate({ inputRange: [0, 1], outputRange: [1.22, 1.44] }) }] }} />
      {PARTICLES.map((p, i) => <UltraParticle key={i} {...p} />)}
    </>
  );
}

// ── NOS Blue: real flame rising upward, stable core, flickering outer tongues ──
function NosFlameAura() {
  const core = useRef(new Animated.Value(0.8)).current;
  const f1 = useRef(new Animated.Value(0)).current;
  const f2 = useRef(new Animated.Value(0)).current;
  const f3 = useRef(new Animated.Value(0)).current;
  const f4 = useRef(new Animated.Value(0)).current;
  const f5 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const coreAnim = Animated.loop(Animated.sequence([
      Animated.timing(core, { toValue: 1,   duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(core, { toValue: 0.7, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const tongue = (v: Animated.Value, delay: number, dur: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur * 0.55, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay(dur * 0.1),
        ])),
      ]);
    const t1 = tongue(f1, 0,   380);
    const t2 = tongue(f2, 150, 340);
    const t3 = tongue(f3, 80,  420);
    const t4 = tongue(f4, 240, 360);
    const t5 = tongue(f5, 50,  300);
    coreAnim.start(); t1.start(); t2.start(); t3.start(); t4.start(); t5.start();
    return () => { coreAnim.stop(); t1.stop(); t2.stop(); t3.stop(); t4.stop(); t5.stop(); };
  }, []);

  const flameRing = (v: Animated.Value, maxSy: number, driftY: number, color: string, op: number) => ({
    position: 'absolute' as const,
    width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
    borderWidth: 2, borderColor: color,
    opacity: v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, op, op * 0.55, 0] }),
    transform: [
      { scaleX: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) },
      { scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [1, maxSy] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -driftY] }) },
    ],
  });

  return (
    <>
      {/* Stable bright core */}
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 3, borderColor: '#0099FF', opacity: core }} />
      {/* Rising flame tongues */}
      <Animated.View style={flameRing(f1, 2.8, 18, '#00F5FF', 0.9)} />
      <Animated.View style={flameRing(f2, 2.4, 14, '#0088FF', 0.85)} />
      <Animated.View style={flameRing(f3, 3.6, 24, '#00CCFF', 0.65)} />
      <Animated.View style={flameRing(f4, 2.0, 10, '#00F5FF', 0.8)} />
      <Animated.View style={flameRing(f5, 4.2, 28, '#44DDFF', 0.5)} />
    </>
  );
}

// ── Miami Pink: Synthwave — orbiting ellipses + heatwave scaleX distortion ──
function SynthwaveAura() {
  const rot1  = useRef(new Animated.Value(0)).current;
  const rot2  = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const r1 = Animated.loop(Animated.timing(rot1, { toValue: 1, duration: 5500, easing: Easing.linear, useNativeDriver: true }));
    const r2 = Animated.loop(Animated.timing(rot2, { toValue: 1, duration: 8500, easing: Easing.linear, useNativeDriver: true }));
    const w1 = Animated.loop(Animated.sequence([
      Animated.timing(wave1, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(wave1, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const w2 = Animated.sequence([
      Animated.delay(1100),
      Animated.loop(Animated.sequence([
        Animated.timing(wave2, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wave2, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
    ]);
    r1.start(); r2.start(); w1.start(); w2.start();
    return () => { r1.stop(); r2.stop(); w1.stop(); w2.stop(); };
  }, []);

  // Ellipses centered on (44,44) — verified: left+w/2=44, top+h/2=44
  const spin1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spin2 = rot2.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });

  return (
    <>
      {/* Orbiting ellipses give the "orbit/wave" feel */}
      <Animated.View style={{ position: 'absolute', width: 130, height: 40, top: 24, left: -21, borderRadius: 20, borderWidth: 1.5, borderColor: '#FF0080', opacity: 0.7, transform: [{ rotate: spin1 }] }} />
      <Animated.View style={{ position: 'absolute', width: 40, height: 120, top: -16, left: 24, borderRadius: 20, borderWidth: 1, borderColor: '#CC00FF', opacity: 0.55, transform: [{ rotate: spin2 }] }} />
      {/* Heatwave horizontal distortion rings */}
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 2, borderColor: '#FF0080',
        opacity: wave1.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.85] }),
        transform: [
          { scaleX: wave1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.04, 1.18, 1.04] }) },
          { scaleY: wave1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.96, 0.86, 0.96] }) },
        ],
      }} />
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 1.5, borderColor: '#FF44AA',
        opacity: wave2.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.6] }),
        transform: [
          { scaleX: wave2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.12, 1.26, 1.12] }) },
          { scaleY: wave2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.88, 0.78, 0.88] }) },
        ],
      }} />
    </>
  );
}

// ── Ghost White: Angelic — expanding halos + faint cross-shimmer rays ──
function AngelicAura() {
  const r1      = useRef(new Animated.Value(0)).current;
  const r2      = useRef(new Animated.Value(0)).current;
  const r3      = useRef(new Animated.Value(0)).current;
  const r4      = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const period = 3000;
    const ripple = (v: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(Animated.timing(v, { toValue: 1, duration: period, easing: Easing.out(Easing.quad), useNativeDriver: true })),
      ]);
    const shimAnim = Animated.loop(Animated.sequence([
      Animated.timing(shimmer, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(shimmer, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const l1 = ripple(r1, 0); const l2 = ripple(r2, period / 4);
    const l3 = ripple(r3, period / 2); const l4 = ripple(r4, (period * 3) / 4);
    l1.start(); l2.start(); l3.start(); l4.start(); shimAnim.start();
    return () => { l1.stop(); l2.stop(); l3.stop(); l4.stop(); shimAnim.stop(); };
  }, []);

  const halo = (v: Animated.Value, color: string) => ({
    position: 'absolute' as const, width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
    borderWidth: 1.5, borderColor: color,
    opacity: v.interpolate({ inputRange: [0, 0.07, 0.72, 1], outputRange: [0, 0.72, 0.12, 0] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.7] }) }],
  });

  // Thin shimmer rays centered on avatar (top=9, left=43.25 centers a 1.5x70 element at 44,44)
  const rayStyle = (deg: number, phase: [number, number]) => ({
    position: 'absolute' as const, width: 1.5, height: 70, top: 9, left: 43.25,
    backgroundColor: '#FFE8A0', borderRadius: 1,
    opacity: shimmer.interpolate({ inputRange: phase, outputRange: [0, 0.28], extrapolate: 'clamp' }),
    transform: [{ rotate: `${deg}deg` }],
  });

  return (
    <>
      <Animated.View style={halo(r1, '#FFFFFF')} />
      <Animated.View style={halo(r2, '#FFE8B0')} />
      <Animated.View style={halo(r3, '#E8F4FF')} />
      <Animated.View style={halo(r4, '#FFFFFF')} />
      <Animated.View style={rayStyle(45,  [0, 0.8])} />
      <Animated.View style={rayStyle(135, [0.1, 0.9])} />
      <Animated.View style={rayStyle(0,   [0.3, 1.0])} />
      <Animated.View style={rayStyle(90,  [0.5, 1.0])} />
    </>
  );
}

// ── Blood Red: Heartbeat — lub-dub pulse rhythm + shockwave rings ──
function HeartbeatAura() {
  const lub    = useRef(new Animated.Value(0)).current;
  const dub    = useRef(new Animated.Value(0)).current;
  const shock1 = useRef(new Animated.Value(0)).current;
  const shock2 = useRef(new Animated.Value(0)).current;
  const glow   = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    // Lub-dub heartbeat: strong beat, short gap, weaker beat, long rest
    const heartbeat = Animated.loop(Animated.sequence([
      Animated.timing(lub,  { toValue: 1, duration: 140, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(lub,  { toValue: 0, duration: 220, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(90),
      Animated.timing(dub,  { toValue: 1, duration: 110, easing: Easing.out(Easing.exp), useNativeDriver: true }),
      Animated.timing(dub,  { toValue: 0, duration: 190, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.delay(950),
    ]));
    // Shockwaves expand outward on each beat cycle
    const sw1 = Animated.loop(Animated.sequence([
      Animated.timing(shock1, { toValue: 1, duration: 580, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(shock1, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.delay(1120),
    ]));
    const sw2 = Animated.sequence([
      Animated.delay(220),
      Animated.loop(Animated.sequence([
        Animated.timing(shock2, { toValue: 1, duration: 680, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(shock2, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(1020),
      ])),
    ]);
    const glowAnim = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 0.7, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.2, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    heartbeat.start(); sw1.start(); sw2.start(); glowAnim.start();
    return () => { heartbeat.stop(); sw1.stop(); sw2.stop(); glowAnim.stop(); };
  }, []);

  return (
    <>
      {/* Always-on pulsing base glow */}
      <Animated.View style={{ position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44, borderWidth: 2.5, borderColor: '#CC5500', opacity: glow }} />
      {/* LUB — big strong beat */}
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 3.5, borderColor: '#FF8C00',
        opacity: lub.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
        transform: [{ scale: lub.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
      }} />
      {/* DUB — softer secondary beat */}
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 2, borderColor: '#FF6B00',
        opacity: dub.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.85, 0] }),
        transform: [{ scale: dub.interpolate({ inputRange: [0, 1], outputRange: [1.08, 1.42] }) }],
      }} />
      {/* Shockwave 1 — expands far out */}
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 1.5, borderColor: '#FF8C00',
        opacity: shock1.interpolate({ inputRange: [0, 0.08, 0.65, 1], outputRange: [0, 0.9, 0.25, 0] }),
        transform: [{ scale: shock1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
      }} />
      {/* Shockwave 2 — expands even further, deeper orange */}
      <Animated.View style={{
        position: 'absolute', width: 88, height: 88, top: 0, left: 0, borderRadius: 44,
        borderWidth: 1, borderColor: '#994400',
        opacity: shock2.interpolate({ inputRange: [0, 0.08, 0.6, 1], outputRange: [0, 0.7, 0.15, 0] }),
        transform: [{ scale: shock2.interpolate({ inputRange: [0, 1], outputRange: [1.1, 3.0] }) }],
      }} />
    </>
  );
}

function AuraEffect({ aura }: { aura: string }) {
  if (aura === 'bolt')       return <NosFlameAura />;
  if (aura === 'miami_pink') return <SynthwaveAura />;
  return null;
}

// ── Flip card ─────────────────────────────────────────────────────────────────

const FlipCard = React.memo(function FlipCard({ data }: { data: CardData }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const animValue = useRef(new Animated.Value(0)).current;

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(animValue, { toValue, friction: 8, tension: 40, useNativeDriver: true })
      .start(() => setIsFlipped(!isFlipped));
  };

  const frontRotate = animValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = animValue.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  // backfaceVisibility is unreliable on iOS inside Modals — opacity is the reliable fallback
  const frontOpacity = animValue.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity  = animValue.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const outlineColor = data.cardStyle?.outlineColor ?? Colors.accent;
  const backgroundId = data.cardStyle?.background ?? 'original';
  const bgColor      = CARD_BACKGROUNDS.find(b => b.id === backgroundId)?.color ?? Colors.card;

  return (
    <>
      <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
        <Animated.View
          pointerEvents={isFlipped ? 'none' : 'box-none'}
          style={[StyleSheet.absoluteFill, { opacity: frontOpacity, transform: [{ perspective: 1200 }, { rotateY: frontRotate }], backfaceVisibility: 'hidden' }]}
        >
          <CardFront data={data} onFlip={handleFlip} outlineColor={outlineColor} bgColor={bgColor} backgroundId={backgroundId} />
        </Animated.View>
        <Animated.View
          pointerEvents={isFlipped ? 'box-none' : 'none'}
          style={[StyleSheet.absoluteFill, { opacity: backOpacity, transform: [{ perspective: 1200 }, { rotateY: backRotate }], backfaceVisibility: 'hidden' }]}
        >
          <CardBack data={data} onFlip={handleFlip} outlineColor={outlineColor} bgColor={bgColor} backgroundId={backgroundId} />
        </Animated.View>
      </View>
    </>
  );
});

export default FlipCard;

// ── Rank info data + modal ────────────────────────────────────────────────────

const RANKS_INFO = [
  {
    gearNum: 0,
    name: 'LOT LIZARD',
    tag: 'Rank 0  ·  Starting Point',
    color: '#888888',
    description: "You're in the scene, but from a distance. You appreciate the culture, the builds, the energy — but you move quietly. Rare appearances, minimal involvement, no real footprint yet. You're here for the vibe, not the spotlight… at least for now.",
  },
  {
    gearNum: 1,
    name: '1ST GEAR',
    tag: 'Rank 1',
    color: '#4488FF',
    description: "The ignition point. You've started showing up, getting familiar faces, and slowly building your presence. A few hosted meets, more consistent attendance, people are beginning to recognize the name. Early stages, but the foundation is being set.",
  },
  {
    gearNum: 2,
    name: '2ND GEAR',
    tag: 'Rank 2',
    color: '#00CCFF',
    description: "Momentum is real now. Your network has grown past 1,000, your reputation is solid, and your presence is becoming consistent. You're not just attending… you're contributing. People trust your name, and you're starting to stand out in the crowd.",
  },
  {
    gearNum: 3,
    name: '3RD GEAR',
    tag: 'Rank 3',
    color: '#00FF88',
    description: "You're making noise. With over 2,000 in your network and serious activity behind you, your name carries weight. Hundreds of meets attended and hosted — you're no longer just part of the scene, you're shaping it. Recognition follows you.",
  },
  {
    gearNum: 4,
    name: '4TH GEAR',
    tag: 'Rank 4',
    color: '#FFE000',
    description: "City status achieved. You're well known, highly respected, and deeply active. With 4,000+ in your network and major numbers behind your name, you've built real influence. At this level, you're not thinking local anymore… you're ready to expand beyond your city and dominate new ground.",
  },
  {
    gearNum: 5,
    name: '5TH GEAR',
    tag: 'Rank 5',
    color: '#FF8800',
    description: "Welcome to the big leagues. Your network is massive, your reputation undeniable, and your consistency unmatched. Thousands of meets attended and hosted — you've proven your commitment at scale. Your name holds authority, and building a successful OOF club is no longer a goal… it's expected.",
  },
  {
    gearNum: 6,
    name: '6TH GEAR',
    tag: 'Rank 6',
    color: '#FF0080',
    description: "Extremely rare. Reaching this level puts you in a category of your own. With over 200,000 in your network and relentless activity, you've become a defining figure in the culture. OOF recognizes you — featured, highlighted, and celebrated. At this level, you're not chasing the scene… you are the scene.",
  },
  {
    gearNum: 7,
    name: 'OOF LEGEND',
    tag: 'Rank 7  ·  Hall of Fame',
    color: '#FFD700',
    description: "A different breed entirely. From a kid who loved cars to being widely known and respected for that exact passion — you've turned love into legacy. With a network exceeding 1,000,000, you've built more than a name, you've built a movement. Permanently placed in the OOF Hall of Fame, you represent the pinnacle of the culture.",
  },
];

const RANK_NOTE = "Rank never defines who someone is in the car scene. Some people prefer to stay low, enjoy the builds, and be part of the culture without chasing recognition. Others push to grow, expand, and make a name for themselves — or even build a career. Both paths carry equal respect. OOF is here to support all of it.";

// H-pattern gear positions: [col 0..2, row 0=top/1=bottom]
// gear 1=col0/top, 2=col0/bot, 3=col1/top, 4=col1/bot, 5=col2/top, 6=col2/bot
const GEAR_POSITIONS: Record<number, [number, number]> = {
  1: [0, 0], 2: [0, 1], 3: [1, 0], 4: [1, 1], 5: [2, 0], 6: [2, 1],
};

function GearShiftIcon({ gearNum, color }: { gearNum: number; color: string }) {
  const DOT = 9;
  const COL_GAP = 22;
  const ROW_GAP = 20;
  const W = COL_GAP * 2 + DOT;
  const H = ROW_GAP + DOT;
  const midY = H / 2;

  const isLit = (col: number, row: number) => {
    if (gearNum === 7) return true; // LEGEND — all lit
    if (gearNum === 0) return false; // neutral — none lit
    const pos = GEAR_POSITIONS[gearNum];
    return pos && pos[0] === col && pos[1] === row;
  };

  const dotX = (col: number) => col * COL_GAP;
  const dotY = (row: number) => row * ROW_GAP;

  return (
    <View style={{ width: W + DOT, height: H + DOT, position: 'relative' }}>
      {/* horizontal rail */}
      <View style={{
        position: 'absolute',
        left: DOT / 2, right: DOT / 2,
        top: midY,
        height: 1.5,
        backgroundColor: '#333355',
      }} />
      {/* vertical stubs + dots */}
      {[0, 1, 2].map(col => (
        <View key={col}>
          {/* vertical stub */}
          <View style={{
            position: 'absolute',
            left: dotX(col) + DOT / 2 - 0.75,
            top: DOT / 2,
            width: 1.5,
            height: ROW_GAP,
            backgroundColor: '#333355',
          }} />
          {[0, 1].map(row => {
            const lit = isLit(col, row);
            return (
              <View key={row} style={{
                position: 'absolute',
                left: dotX(col),
                top: dotY(row),
                width: DOT,
                height: DOT,
                borderRadius: DOT / 2,
                backgroundColor: lit ? color : '#1A1A2E',
                borderWidth: lit ? 0 : 1,
                borderColor: '#333355',
                shadowColor: lit ? color : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: lit ? 0.5 : 0,
                shadowRadius: 5,
              }} />
            );
          })}
        </View>
      ))}
      {/* neutral dot in center for Lot Lizard */}
      {gearNum === 0 && (
        <View style={{
          position: 'absolute',
          left: dotX(1) + DOT / 2 - 4,
          top: midY - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
        }} />
      )}
    </View>
  );
}

function RankInfoModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <View style={rm.overlay}>
        <View style={rm.sheet}>
          <View style={rm.header}>
            <Text style={rm.title}>HOW DOES RANK WORK IN OOF?</Text>
            <Pressable onPress={onClose} style={rm.closeBtn}>
              <Text style={rm.closeBtnTxt}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={rm.scroll}>
            {RANKS_INFO.map((r, i) => (
              <View key={i} style={[rm.rankCard, i === RANKS_INFO.length - 1 && rm.legendCard]}>
                <View style={rm.rankTopRow}>
                  <GearShiftIcon gearNum={r.gearNum} color={r.color} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={[rm.rankName, { color: r.color, textShadowColor: r.color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 }]}>
                      {r.name}
                    </Text>
                    <Text style={[rm.rankTag, { color: r.color + 'AA' }]}>{r.tag}</Text>
                  </View>
                </View>
                <View style={[rm.rankDivider, { backgroundColor: r.color + '40' }]} />
                <Text style={rm.rankDesc}>{r.description}</Text>
              </View>
            ))}

            <View style={rm.noteBox}>
              <Ionicons name="information-circle" size={16} color="#555" style={{ marginBottom: 8 }} />
              <Text style={rm.noteTxt}>{RANK_NOTE}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const rm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#080810', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: '#1A1A2E', maxHeight: '90%' },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#111122' },
  title:      { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 2.5, flex: 1 },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A2E', justifyContent: 'center', alignItems: 'center' },
  closeBtnTxt:{ color: '#888', fontSize: 14, fontWeight: '700' },
  scroll:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  rankCard:   { backgroundColor: '#0D0D1F', borderRadius: 14, borderWidth: 1, borderColor: '#1A1A2E', padding: 16, marginBottom: 12 },
  legendCard: { borderColor: '#FFD70040', backgroundColor: '#120F00' },
  rankTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankName:   { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  rankTag:    { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  rankDivider:{ height: 1, marginBottom: 10 },
  rankDesc:   { color: '#8888AA', fontSize: 13, lineHeight: 20, fontWeight: '400' },
  noteBox:    { backgroundColor: '#0D0D1F', borderRadius: 14, borderWidth: 1, borderColor: '#1A1A2E', padding: 16, alignItems: 'center', marginTop: 4 },
  noteTxt:    { color: '#555566', fontSize: 12, lineHeight: 19, textAlign: 'center', fontStyle: 'italic' },
});

// ── Card front ────────────────────────────────────────────────────────────────

export function CardFront({
  data, onFlip, outlineColor, bgColor, backgroundId,
}: {
  data: CardData; onFlip?: () => void; outlineColor: string; bgColor: string; backgroundId: string;
}) {
  const aura = data.cardStyle?.aura ?? 'none';
  const isWhite = backgroundId === 'white';
  const textPrimary = isWhite ? '#111111' : Colors.text;
  const textSub     = isWhite ? '#555555' : Colors.textSecondary;
  const textMuted   = isWhite ? '#777777' : Colors.textMuted;
  const dividerClr  = isWhite ? '#CCCCCC' : Colors.divider;

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: outlineColor, shadowColor: outlineColor }]}>
      <CardBgTexture backgroundId={backgroundId} />
      <CardAuraEffect aura={aura} />
      <View style={styles.cardInner}>
        <View style={styles.topRow}>
          {data.skrrId ? (
            <View style={[styles.skrrIdBadge, { borderColor: outlineColor + '50', backgroundColor: outlineColor + '10' }]}>
              <Text style={[styles.skrrIdText, { color: outlineColor }]}>#{data.skrrId}</Text>
            </View>
          ) : <View />}
          <Pressable style={[styles.flipBtn, { borderColor: outlineColor + '80', backgroundColor: outlineColor + '15' }]} onPress={onFlip}>
            <Text style={[styles.flipBtnText, { color: outlineColor }]}>VEHICLE STATS</Text>
            <Ionicons name="chevron-forward" size={10} color={outlineColor} />
          </Pressable>
        </View>

        <View style={styles.profilePhotoWrap}>
          <View style={{ width: 88, height: 88 }}>
            <AuraEffect aura={aura} />
            {data.profilePhoto ? (
              <Image source={{ uri: data.profilePhoto }} style={[styles.profilePhotoCircle, { borderColor: outlineColor }]} />
            ) : (
              <View style={[styles.profilePhotoCircle, { borderColor: outlineColor, shadowColor: outlineColor }]}>
                <Ionicons name="person" size={46} color={textMuted} />
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.username, { color: textPrimary }]}>{data.username}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={13} color={outlineColor} />
          <Text style={[styles.infoText, { color: textSub }]}>{data.location}</Text>
        </View>

        <View style={[styles.carBadge, { borderColor: outlineColor + '50', backgroundColor: outlineColor + '15' }]}>
          <Ionicons name="car-sport" size={14} color={outlineColor} />
          <Text style={[styles.carText, { color: textPrimary }]}>{data.car.year} {data.car.make} {data.car.model}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: dividerClr }]} />

        <View style={styles.statsRow}>
          <StatItem label="MEETS"      value={data.stats.meetsAttended} icon="car-sport"  accent={outlineColor} textMuted={textMuted} />
          <View style={[styles.statDivider, { backgroundColor: dividerClr }]} />
          <StatItem label="HOSTED"     value={data.stats.meetsHosted}   icon="trophy"     accent={outlineColor} textMuted={textMuted} />
          <View style={[styles.statDivider, { backgroundColor: dividerClr }]} />
          <StatItem label="NETWORK"    value={data.stats.friends}       icon="people"     accent={outlineColor} textMuted={textMuted} />
          <View style={[styles.statDivider, { backgroundColor: dividerClr }]} />
          <StatItem label="RESPECT" value={data.stats.rating} icon="flame" accent={outlineColor} textMuted={textMuted} />
        </View>

        <View style={styles.skrrWordmarkWrap}>
          <Image
            source={require('../assets/oof-wordmark.png')}
            style={styles.skrrWordmarkImg}
            resizeMode="contain"
            tintColor={outlineColor}
          />
        </View>

        <View style={[styles.glowLine, { backgroundColor: outlineColor, shadowColor: outlineColor }]} />
      </View>
    </View>
  );
}

// ── Card back ─────────────────────────────────────────────────────────────────

export function CardBack({
  data, onFlip, outlineColor, bgColor, backgroundId,
}: {
  data: CardData; onFlip?: () => void; outlineColor: string; bgColor: string; backgroundId: string;
}) {
  const [showAllMods, setShowAllMods] = React.useState(false);
  const aura = data.cardStyle?.aura ?? 'none';
  const isWhite    = backgroundId === 'white';
  const textPrimary = isWhite ? '#111111' : Colors.text;
  const textSub     = isWhite ? '#555555' : Colors.textSecondary;
  const textMuted   = isWhite ? '#777777' : Colors.textMuted;
  const inputBg     = isWhite ? '#E8E8E8' : Colors.inputBg;
  const dividerClr  = isWhite ? '#CCCCCC' : Colors.divider;

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor: outlineColor, shadowColor: outlineColor }]}>
      <CardBgTexture backgroundId={backgroundId} />
      <CardAuraEffect aura={aura} />
      <View style={styles.cardInner}>
        <Pressable style={[styles.flipBtn, { borderColor: outlineColor + '80', backgroundColor: outlineColor + '15' }]} onPress={onFlip}>
          <Ionicons name="chevron-back" size={10} color={outlineColor} />
          <Text style={[styles.flipBtnText, { color: outlineColor }]}>FLIP BACK</Text>
        </Pressable>

        {data.car.photo ? (
          <Image source={{ uri: data.car.photo }} style={[styles.carPhotoImage, { borderColor: outlineColor + '60' }]} />
        ) : (
          <View style={[styles.carPhotoWrap, { backgroundColor: inputBg, borderColor: dividerClr }]}>
            <Ionicons name="car-sport" size={36} color={textMuted} />
            <Text style={[styles.carPhotoLabel, { color: textMuted }]}>{data.car.year} {data.car.make} {data.car.model}</Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <StatBox label="HP"         value={`${data.car.hp}`}          accent={outlineColor} textMuted={textMuted} />
          <StatBox label="TORQUE"     value={`${data.car.torque} lb-ft`} accent={outlineColor} textMuted={textMuted} />
          <StatBox label="0-60"       value={data.car.zeroToSixty}      accent={outlineColor} textMuted={textMuted} />
          <StatBox label="DRIVETRAIN" value={data.car.drivetrain}        accent={outlineColor} textMuted={textMuted} />
        </View>

        <View style={[styles.engineRow, { backgroundColor: inputBg }]}>
          <Text style={[styles.engineLabel, { color: textMuted }]}>ENGINE</Text>
          <Text style={[styles.engineValue, { color: textPrimary }]}>{data.car.engine}</Text>
        </View>

        <View style={styles.modsSection}>
          <Text style={[styles.modsLabel, { color: textMuted }]}>MODS</Text>
          {(showAllMods ? data.car.mods : data.car.mods.slice(0, 4)).map((mod, i) => (
            <View key={i} style={styles.modItem}>
              <View style={[styles.modDot, { backgroundColor: outlineColor }]} />
              <Text style={[styles.modText, { color: outlineColor }]} numberOfLines={1}>{mod}</Text>
            </View>
          ))}
          {data.car.mods.length > 4 && (
            <TouchableOpacity onPress={() => setShowAllMods(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.moreMods, { color: outlineColor }]}>
                {showAllMods ? '▲ show less' : `+${data.car.mods.length - 4} more`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.glowLine, { backgroundColor: outlineColor, shadowColor: outlineColor }]} />
      </View>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CrownIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 18 L3 13 L7 8 L10.5 12.5 L12 6 L13.5 12.5 L17 8 L21 13 L21 18 Z"
        fill={color}
      />
    </Svg>
  );
}

function StatItem({ label, value, icon, accent, textMuted }: { label: string; value: number; icon?: any; accent: string; textMuted: string }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statValueRow}>
        {icon === 'crown'
          ? <CrownIcon size={13} color={accent} />
          : icon
            ? <Ionicons name={icon} size={13} color={accent} />
            : null}
        <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      </View>
      <Text style={[styles.statLabel, { color: accent }]}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value, accent, textMuted }: { label: string; value: string; accent: string; textMuted: string }) {
  return (
    <View style={[styles.statBox, { borderColor: accent + '50', backgroundColor: accent + '12' }]}>
      <Text style={[styles.statBoxValue, { color: accent }]}>{value}</Text>
      <Text style={[styles.statBoxLabel, { color: textMuted }]}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH, height: CARD_HEIGHT,
    borderRadius: 20, borderWidth: 2.5,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 20,
    elevation: 15, overflow: 'hidden',
  },
  cardInner: { flex: 1, padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  skrrIdBadge: { borderWidth: 1, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  skrrIdText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  flipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  flipBtnText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  profilePhotoWrap: { alignItems: 'center', marginBottom: 14 },
  profilePhotoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.inputBg, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  username: { fontSize: 22, fontWeight: '900', textAlign: 'center', letterSpacing: 1, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 },
  infoText: { fontSize: 12, fontWeight: '500' },
  carBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7,
    alignSelf: 'center', marginBottom: 16,
  },
  carText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  divider: { height: 1, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1, marginTop: 3 },
  statDivider: { width: 1, height: 28 },
  rankSection: { alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1 },
  rankLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 4, marginBottom: 4, textAlign: 'center' },
  rankValue: { fontSize: 28, fontWeight: '900', letterSpacing: 6, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4, textAlign: 'center' },
  rankInfoBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  rankInfoBtnTxt: { fontSize: 13, fontWeight: '900', lineHeight: 14 },
  achievementsSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  achievementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  achievementsLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  achievementsCount: { fontSize: 9, fontWeight: '600' },
  achievementsBadges: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  achievementBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.inputBg, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  achievementMore: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.inputBg, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  achievementMoreText: { fontSize: 8, fontWeight: '700' },
  skrrWordmarkWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center' },
  skrrWordmarkImg:   { width: CARD_WIDTH - 40, height: 200, marginLeft: -12 },
  glowLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  carPhotoWrap: {
    height: 160, borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, gap: 4,
  },
  carPhotoImage: { height: 160, borderRadius: 10, marginBottom: 10, borderWidth: 1 },
  carPhotoLabel: { fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 7 },
  statBox: {
    flex: 1, minWidth: '45%', borderWidth: 1, borderRadius: 8, padding: 7, alignItems: 'center',
  },
  statBoxValue: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  statBoxLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  engineRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 7,
  },
  engineLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  engineValue: { fontSize: 11, fontWeight: '700' },
  modsSection: { flex: 1 },
  modsLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  modItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  modDot: { width: 4, height: 4, borderRadius: 2, flexShrink: 0 },
  modText: { fontSize: 11, fontWeight: '500', flex: 1 },
  moreMods: { fontSize: 10, fontWeight: '700', marginTop: 4 },
});
