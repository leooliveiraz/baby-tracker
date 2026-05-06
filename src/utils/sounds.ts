let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch { /* ignore */ }
}

export function playFeedSound() {
  playTone(600, 0.15, 'sine')
  setTimeout(() => playTone(800, 0.1, 'sine'), 100)
}

export function playDiaperSound() {
  playTone(300, 0.2, 'triangle')
  setTimeout(() => playTone(400, 0.15, 'triangle'), 80)
}

export function playSleepSound() {
  playTone(500, 0.3, 'sine')
  setTimeout(() => playTone(400, 0.3, 'sine'), 150)
}

export function playSuccessSound() {
  playTone(523, 0.1)
  setTimeout(() => playTone(659, 0.1), 100)
  setTimeout(() => playTone(784, 0.15), 200)
}

export function playDeleteSound() {
  playTone(400, 0.1, 'sawtooth')
  setTimeout(() => playTone(300, 0.15, 'sawtooth'), 60)
}

export function playButtonSound() {
  playTone(800, 0.05, 'sine')
}

const SOUND_KEY = 'baby-tracker-sound'

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'disabled'
  } catch { return true }
}

export function toggleSound(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'enabled' : 'disabled')
  } catch { /* ignore */ }
}
