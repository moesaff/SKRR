import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let sound: Audio.Sound | null = null;

function buildGlassClickWav(): string {
  const SR = 44100;
  const MS = 90; // 90ms — short glass ping
  const N = Math.floor((SR * MS) / 1000);
  const F1 = 1350; // primary glass frequency
  const F2 = 2800; // harmonic overtone

  const totalBytes = 44 + N * 2;
  const buf = new ArrayBuffer(totalBytes);
  const v = new DataView(buf);

  const ws = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };

  ws(0, 'RIFF');
  v.setUint32(4, totalBytes - 8, true);
  ws(8, 'WAVE');
  ws(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);       // PCM
  v.setUint16(22, 1, true);       // mono
  v.setUint32(24, SR, true);
  v.setUint32(28, SR * 2, true);  // byte rate
  v.setUint16(32, 2, true);       // block align
  v.setUint16(34, 16, true);      // 16-bit
  ws(36, 'data');
  v.setUint32(40, N * 2, true);

  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // Quick attack (first 3ms), then exponential decay — glass physics
    const attack = Math.min(1, t / 0.003);
    const decay = Math.exp(-t * 55);
    const sample =
      attack * decay * (
        Math.sin(2 * Math.PI * F1 * t) * 0.65 +
        Math.sin(2 * Math.PI * F2 * t) * 0.35
      );
    v.setInt16(44 + i * 2, Math.round(sample * 26000), true);
  }

  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

export async function initGlassClick(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,   // play even when phone is on silent
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });
    const b64 = buildGlassClickWav();
    const path = (FileSystem.cacheDirectory ?? '') + 'skrr_glass_click.wav';
    await FileSystem.writeAsStringAsync(path, b64, {
      encoding: 'base64' as any,
    });
    const { sound: s } = await Audio.Sound.createAsync(
      { uri: path },
      { volume: 1.0, shouldPlay: false }
    );
    sound = s;
    console.log('[sound] glass click ready ✓');
  } catch (e) {
    console.warn('[sound] init failed:', e);
  }
}

export async function playGlassClick(): Promise<void> {
  try {
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // silent fail — never block UI
  }
}
