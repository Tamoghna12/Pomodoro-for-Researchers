export type MusicSourceType = 'spotify' | 'youtube' | 'direct' | 'soundcloud'

export interface MusicTrack {
  id: string
  title: string
  artist: string
  sourceType: MusicSourceType
  url: string
  embedUrl?: string
  duration?: number
  thumbnail?: string
  isUserAdded?: boolean
}

export interface MusicPlaylist {
  id: string
  name: string
  description: string
  tracks: MusicTrack[]
  isDefault: boolean
}

export interface MusicSettings {
  volume: number
  enabled: boolean
  autoPlay: boolean
  currentPlaylist: string | null
  currentTrack: string | null
}

class MusicService {
  private currentAudio: HTMLAudioElement | null = null
  private currentIframe: HTMLIFrameElement | null = null
  private settings: MusicSettings
  private playlists: MusicPlaylist[] = []
  private isInitialized = false
  private currentTrackIndex = 0
  private isPlaying = false

  constructor() {
    this.settings = this.loadSettings()
    this.initializeDefaultPlaylists()
  }

  private loadSettings(): MusicSettings {
    try {
      const saved = localStorage.getItem('music-settings')
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error('Failed to load music settings:', error)
    }
    return this.getDefaultSettings()
  }

  private getDefaultSettings(): MusicSettings {
    return {
      volume: 50,
      enabled: true,
      autoPlay: false,
      currentPlaylist: 'focus-sounds',
      currentTrack: null
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('music-settings', JSON.stringify(this.settings))
    } catch (error) {
      console.error('Failed to save music settings:', error)
    }
  }

  private initializeDefaultPlaylists(): void {
    this.playlists = [
      {
        id: 'focus-sounds',
        name: 'Focus Sounds',
        description: 'Curated focus music from various sources',
        isDefault: true,
        tracks: [
          {
            id: 'spotify-1',
            title: 'Focus Flow',
            artist: 'Spotify Playlist',
            sourceType: 'spotify',
            url: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
            embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0'
          },
          {
            id: 'youtube-1',
            title: 'Deep Focus Music',
            artist: 'YouTube',
            sourceType: 'youtube',
            url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
            embedUrl: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&controls=1'
          },
          {
            id: 'direct-1',
            title: 'Nature Sounds',
            artist: 'Direct Audio',
            sourceType: 'direct',
            url: 'https://www.soundjay.com/misc/sounds/rain-01.wav'
          }
        ]
      },
      {
        id: 'user-music',
        name: 'My Music',
        description: 'Your personal music collection',
        isDefault: false,
        tracks: []
      }
    ]
    this.loadUserTracks()
  }

  private loadUserTracks(): void {
    try {
      const saved = localStorage.getItem('user-music-tracks')
      if (saved) {
        const userPlaylist = this.playlists.find(p => p.id === 'user-music')
        if (userPlaylist) {
          userPlaylist.tracks = JSON.parse(saved)
        }
      }
    } catch (error) {
      console.error('Failed to load user tracks:', error)
    }
  }

  private saveUserTracks(): void {
    try {
      const userPlaylist = this.playlists.find(p => p.id === 'user-music')
      if (userPlaylist) {
        localStorage.setItem('user-music-tracks', JSON.stringify(userPlaylist.tracks))
      }
    } catch (error) {
      console.error('Failed to save user tracks:', error)
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return
    this.isInitialized = true
  }

  public getSettings(): MusicSettings {
    return { ...this.settings }
  }

  public updateSettings(newSettings: Partial<MusicSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }

  public getPlaylists(): MusicPlaylist[] {
    return [...this.playlists]
  }

  public getCurrentPlaylist(): MusicPlaylist | null {
    if (!this.settings.currentPlaylist) return null
    return this.playlists.find(p => p.id === this.settings.currentPlaylist) || null
  }

  public getCurrentTrack(): MusicTrack | null {
    const playlist = this.getCurrentPlaylist()
    if (!playlist || !this.settings.currentTrack) return null
    return playlist.tracks.find(t => t.id === this.settings.currentTrack) || null
  }

  public parseUrl(url: string): { sourceType: MusicSourceType; embedUrl?: string } {
    // Spotify
    if (url.includes('spotify.com')) {
      const embedUrl = url.replace('open.spotify.com', 'open.spotify.com/embed')
      return { sourceType: 'spotify', embedUrl }
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
      }
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`
      return { sourceType: 'youtube', embedUrl }
    }

    // SoundCloud
    if (url.includes('soundcloud.com')) {
      return { sourceType: 'soundcloud' }
    }

    // Direct audio URL
    return { sourceType: 'direct' }
  }

  public async addTrack(url: string, title?: string, artist?: string): Promise<MusicTrack> {
    const { sourceType, embedUrl } = this.parseUrl(url)

    const track: MusicTrack = {
      id: `user-${Date.now()}`,
      title: title || 'Untitled Track',
      artist: artist || 'Unknown Artist',
      sourceType,
      url,
      embedUrl,
      isUserAdded: true
    }

    const userPlaylist = this.playlists.find(p => p.id === 'user-music')
    if (userPlaylist) {
      userPlaylist.tracks.push(track)
      this.saveUserTracks()
    }

    return track
  }

  public removeTrack(trackId: string): void {
    const userPlaylist = this.playlists.find(p => p.id === 'user-music')
    if (userPlaylist) {
      userPlaylist.tracks = userPlaylist.tracks.filter(t => t.id !== trackId)
      this.saveUserTracks()
    }
  }

  public async play(playlistId?: string, trackId?: string): Promise<void> {
    if (!this.settings.enabled) {
      throw new Error('Music is disabled')
    }

    // Set playlist
    if (playlistId && playlistId !== this.settings.currentPlaylist) {
      this.settings.currentPlaylist = playlistId
      this.saveSettings()
    }

    const playlist = this.getCurrentPlaylist()
    if (!playlist || playlist.tracks.length === 0) {
      throw new Error('No tracks available')
    }

    // Find track
    let track: MusicTrack | null = null
    if (trackId) {
      track = playlist.tracks.find(t => t.id === trackId) || null
      this.currentTrackIndex = playlist.tracks.findIndex(t => t.id === trackId)
    } else if (this.settings.currentTrack) {
      track = playlist.tracks.find(t => t.id === this.settings.currentTrack) || null
      this.currentTrackIndex = playlist.tracks.findIndex(t => t.id === this.settings.currentTrack)
    } else {
      track = playlist.tracks[0]
      this.currentTrackIndex = 0
    }

    if (!track) {
      throw new Error('Track not found')
    }

    this.settings.currentTrack = track.id
    this.saveSettings()

    // Stop current playback
    this.stopCurrent()

    // Start new playback based on source type
    await this.playTrack(track)
    this.isPlaying = true
  }

  private async playTrack(track: MusicTrack): Promise<void> {
    switch (track.sourceType) {
      case 'direct':
        await this.playDirectAudio(track)
        break
      case 'spotify':
      case 'youtube':
      case 'soundcloud':
        this.playEmbedded(track)
        break
      default:
        throw new Error(`Unsupported source type: ${track.sourceType}`)
    }
  }

  private async playDirectAudio(track: MusicTrack): Promise<void> {
    this.currentAudio = new Audio(track.url)
    this.currentAudio.volume = this.settings.volume / 100
    this.currentAudio.crossOrigin = 'anonymous'

    try {
      await this.currentAudio.play()
    } catch (error) {
      throw new Error(`Failed to play audio: ${error}`)
    }
  }

  private playEmbedded(track: MusicTrack): void {
    if (!track.embedUrl) {
      throw new Error('No embed URL available')
    }

    // Create iframe for embedded content
    this.currentIframe = document.createElement('iframe')
    this.currentIframe.src = track.embedUrl
    this.currentIframe.width = '100%'
    this.currentIframe.height = '152'
    this.currentIframe.frameBorder = '0'
    this.currentIframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
    this.currentIframe.loading = 'lazy'

    // Note: Embedded players will be shown in the UI component
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause()
    }
    this.isPlaying = false
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play()
      this.isPlaying = true
    }
  }

  public stop(): void {
    this.stopCurrent()
    this.isPlaying = false
  }

  private stopCurrent(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    if (this.currentIframe) {
      this.currentIframe.remove()
      this.currentIframe = null
    }
  }

  public async nextTrack(): Promise<void> {
    const playlist = this.getCurrentPlaylist()
    if (!playlist || playlist.tracks.length === 0) {
      throw new Error('No playlist available')
    }

    this.currentTrackIndex = (this.currentTrackIndex + 1) % playlist.tracks.length
    const nextTrack = playlist.tracks[this.currentTrackIndex]
    return this.play(undefined, nextTrack.id)
  }

  public async previousTrack(): Promise<void> {
    const playlist = this.getCurrentPlaylist()
    if (!playlist || playlist.tracks.length === 0) {
      throw new Error('No playlist available')
    }

    this.currentTrackIndex = this.currentTrackIndex <= 0
      ? playlist.tracks.length - 1
      : this.currentTrackIndex - 1
    const prevTrack = playlist.tracks[this.currentTrackIndex]
    return this.play(undefined, prevTrack.id)
  }

  public setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(100, volume))
    this.saveSettings()
    if (this.currentAudio) {
      this.currentAudio.volume = this.settings.volume / 100
    }
  }

  public isTrackPlaying(): boolean {
    return this.isPlaying
  }

  public getCurrentTime(): number {
    return this.currentAudio ? this.currentAudio.currentTime : 0
  }

  public getDuration(): number {
    return this.currentAudio ? this.currentAudio.duration || 0 : 0
  }

  public getCurrentIframe(): HTMLIFrameElement | null {
    return this.currentIframe
  }

  public seekTo(time: number): void {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time
    }
  }
}

export const musicService = new MusicService()