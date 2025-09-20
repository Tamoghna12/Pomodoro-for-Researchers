export class AudioNotification {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.5

  constructor() {
    this.initAudioContext()
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  async playSessionComplete() {
    if (!this.enabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()
      this.playTone([523.25, 659.25, 783.99], [0.3, 0.3, 0.4], 0.15) // C5, E5, G5
    } catch (error) {
      console.warn('Could not play session complete sound:', error)
    }
  }

  async playSessionStart() {
    if (!this.enabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()
      this.playTone([440, 554.37], [0.2, 0.3], 0.1) // A4, C#5
    } catch (error) {
      console.warn('Could not play session start sound:', error)
    }
  }

  async playBreakComplete() {
    if (!this.enabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()
      this.playTone([349.23, 440, 523.25], [0.2, 0.2, 0.3], 0.12) // F4, A4, C5
    } catch (error) {
      console.warn('Could not play break complete sound:', error)
    }
  }

  async playMinuteWarning() {
    if (!this.enabled || !this.audioContext) return

    try {
      await this.resumeAudioContext()
      this.playTone([880], [0.1], 0.08) // A5
    } catch (error) {
      console.warn('Could not play minute warning sound:', error)
    }
  }

  private playTone(frequencies: number[], durations: number[], gap: number = 0.1) {
    if (!this.audioContext) return

    let startTime = this.audioContext.currentTime

    frequencies.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.setValueAtTime(frequency, startTime)
      oscillator.type = 'sine'

      // Smooth attack and release to avoid clicks
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01)
      gainNode.gain.setValueAtTime(this.volume * 0.3, startTime + durations[index] - 0.01)
      gainNode.gain.linearRampToValueAtTime(0, startTime + durations[index])

      oscillator.start(startTime)
      oscillator.stop(startTime + durations[index])

      startTime += durations[index] + gap
    })
  }
}

// Browser notification API wrapper
export class BrowserNotification {
  private enabled: boolean = false

  constructor() {
    this.requestPermission()
  }

  private async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      this.enabled = permission === 'granted'
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  showSessionComplete(mode: string) {
    if (!this.enabled || !('Notification' in window)) return

    const title = mode === 'work' ? 'Work Session Complete!' : 'Break Time Over!'
    const body = mode === 'work'
      ? 'Great job! Time for a well-deserved break.'
      : 'Break is over. Ready to get back to work?'

    try {
      new Notification(title, {
        body,
        icon: '/pomodoro-icon.svg',
        badge: '/pomodoro-icon.svg',
        tag: 'pomodoro-session',
        requireInteraction: false,
        silent: false,
      })
    } catch (error) {
      console.warn('Could not show notification:', error)
    }
  }

  showMinuteWarning(mode: string) {
    if (!this.enabled || !('Notification' in window)) return

    const title = mode === 'work' ? '1 Minute Left!' : 'Break Almost Over!'
    const body = mode === 'work'
      ? 'Wrap up your current task.'
      : 'Prepare to get back to work.'

    try {
      new Notification(title, {
        body,
        icon: '/pomodoro-icon.svg',
        badge: '/pomodoro-icon.svg',
        tag: 'pomodoro-warning',
        requireInteraction: false,
        silent: true,
      })
    } catch (error) {
      console.warn('Could not show notification:', error)
    }
  }
}

// Combined notification system
export class NotificationSystem {
  private audio: AudioNotification
  private browser: BrowserNotification

  constructor() {
    this.audio = new AudioNotification()
    this.browser = new BrowserNotification()
  }

  setAudioEnabled(enabled: boolean) {
    this.audio.setEnabled(enabled)
  }

  setBrowserNotificationsEnabled(enabled: boolean) {
    this.browser.setEnabled(enabled)
  }

  setVolume(volume: number) {
    this.audio.setVolume(volume)
  }

  async notifySessionComplete(mode: string) {
    if (mode === 'work') {
      await this.audio.playSessionComplete()
    } else {
      await this.audio.playBreakComplete()
    }
    this.browser.showSessionComplete(mode)
  }

  async notifySessionStart() {
    await this.audio.playSessionStart()
  }

  async notifyMinuteWarning(mode: string) {
    await this.audio.playMinuteWarning()
    this.browser.showMinuteWarning(mode)
  }
}