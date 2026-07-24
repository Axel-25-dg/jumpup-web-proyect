// Web Audio API Synthesizer Utility for Interactive SFX
// Zero external files, 100% reliable, zero network latency

class SoundManager {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Read preference if stored
    const savedPref = localStorage.getItem('jumpup_sound_enabled')
    if (savedPref !== null) {
      this.enabled = savedPref === 'true'
    }
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(value: boolean): void {
    this.enabled = value
    localStorage.setItem('jumpup_sound_enabled', String(value))
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled)
    if (this.enabled) {
      this.playChimeSound()
    }
    return this.enabled
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        if (AudioCtx) {
          this.ctx = new AudioCtx()
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return this.ctx
    } catch {
      return null
    }
  }

  /**
   * Energetic Jump sound effect (rising pitch frequency sweep)
   */
  public playJumpSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, ctx.currentTime) // Start at A3
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25) // Ramp to A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.25)
    } catch {
      // Ignore audio context errors if muted by browser
    }
  }

  /**
   * Melodic letter sound pitch based on character index
   */
  public playLetterSound(index: number = 0) {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      // Pentatonic scale frequencies in Hz (C4, D4, E4, G4, A4, C5, D5, E5, G5, A5)
      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]
      const freq = pentatonic[index % pentatonic.length]

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.18)
    } catch {
      // Silence on browser policy restrictions
    }
  }

  /**
   * Quick pop sound for hover or clicks
   */
  public playPopSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } catch {
      // Silence
    }
  }

  /**
   * Sparkle shimmer for images
   */
  public playImageShimmer() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.50]
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04)

        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.15)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + idx * 0.04)
        osc.stop(ctx.currentTime + idx * 0.04 + 0.15)
      })
    } catch {
      // Muted
    }
  }

  /**
   * Success / Chime sound
   */
  public playChimeSound() {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)

        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + i * 0.08)
        osc.stop(ctx.currentTime + i * 0.08 + 0.25)
      })
    } catch {
      // Muted
    }
  }
}

export const soundFx = new SoundManager()
