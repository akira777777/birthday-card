/**
 * Sound effects utility using Web Audio API
 * Generates simple, non-intrusive sounds for interactions
 */

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== "undefined") {
      this.initAudioContext()
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      console.warn("Web Audio API not supported")
      this.audioContext = null
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioContext) {
      this.initAudioContext()
    }
    return this.audioContext
  }

  /**
   * Play a simple tone
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume: number = 0.1
  ) {
    if (!this.enabled || !this.ensureContext()) return

    const ctx = this.audioContext!
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = type
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  }

  /**
   * Play a click/pop sound
   */
  public playClick() {
    if (!this.enabled || !this.ensureContext()) return

    const ctx = this.audioContext!
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05)

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  /**
   * Play a firework/explosion sound
   */
  public playFirework() {
    if (!this.enabled || !this.ensureContext()) return

    const ctx = this.audioContext!
    const duration = 0.3

    // Create a burst of frequencies for explosion effect
    const frequencies = [200, 300, 400, 500]
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.01)
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration)

      const volume = 0.03 / (index + 1)
      gainNode.gain.setValueAtTime(volume, ctx.currentTime + index * 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime + index * 0.01)
      oscillator.stop(ctx.currentTime + duration)
    })
  }

  /**
   * Play a blow/whoosh sound (for blowing out candles)
   */
  public playBlow() {
    if (!this.enabled || !this.ensureContext()) return

    const ctx = this.audioContext!
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = "sawtooth"
    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2)

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(1000, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.04, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  /**
   * Play a success/completion sound
   */
  public playSuccess() {
    if (!this.enabled || !this.ensureContext()) return

    const ctx = this.audioContext!
    const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5 (C major chord)
    const duration = 0.5

    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = "sine"
      oscillator.frequency.value = freq

      gainNode.gain.setValueAtTime(0.06 / (index + 1), ctx.currentTime + index * 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime + index * 0.1)
      oscillator.stop(ctx.currentTime + duration)
    })
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
