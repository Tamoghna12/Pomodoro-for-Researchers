import React, { useState, useEffect } from 'react'
import { musicService, MusicTrack, MusicPlaylist, MusicSettings } from '../services/musicService'
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  X,
  Settings,
  List,
  Plus,
  ExternalLink,
  Trash2
} from 'lucide-react'

interface MusicPlayerProps {
  onClose: () => void
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<MusicSettings>(musicService.getSettings())
  const [playlists] = useState<MusicPlaylist[]>(musicService.getPlaylists())
  const [currentPlaylist, setCurrentPlaylist] = useState<MusicPlaylist | null>(musicService.getCurrentPlaylist())
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(musicService.getCurrentTrack())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [showAddTrack, setShowAddTrack] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTrackUrl, setNewTrackUrl] = useState('')
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [newTrackArtist, setNewTrackArtist] = useState('')
  const [currentIframe, setCurrentIframe] = useState<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const updateState = () => {
      setIsPlaying(musicService.isTrackPlaying())
      setCurrentTime(musicService.getCurrentTime())
      setDuration(musicService.getDuration())
      setCurrentIframe(musicService.getCurrentIframe())
    }

    const interval = setInterval(updateState, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Initialize music service
    musicService.initialize().catch(error => {
      console.error('Failed to initialize music service:', error)
    })
  }, [])

  const handlePlayPause = async () => {
    try {
      setError(null)
      if (isPlaying) {
        musicService.pause()
        setIsPlaying(false)
      } else {
        if (!currentTrack) {
          // Start from current playlist or default
          await musicService.play()
        } else {
          musicService.resume()
        }
        setIsPlaying(musicService.isTrackPlaying())
      }
    } catch (error) {
      console.error('Failed to play/pause:', error)
      setError(error instanceof Error ? error.message : 'Failed to play music')
    }
  }

  const handleVolumeChange = (volume: number) => {
    musicService.setVolume(volume)
    setSettings(prev => ({ ...prev, volume }))
  }

  const handleEnableToggle = () => {
    const newEnabled = !settings.enabled
    musicService.updateSettings({ enabled: newEnabled })
    setSettings(prev => ({ ...prev, enabled: newEnabled }))

    if (!newEnabled && isPlaying) {
      musicService.pause()
      setIsPlaying(false)
    }
  }

  const handleTrackSelect = async (trackId: string) => {
    try {
      setError(null)
      await musicService.play(undefined, trackId)
      setCurrentTrack(musicService.getCurrentTrack())
      setIsPlaying(musicService.isTrackPlaying())
    } catch (error) {
      console.error('Failed to switch track:', error)
      setError(error instanceof Error ? error.message : 'Failed to switch track')
    }
  }

  const handlePlaylistSelect = async (playlistId: string) => {
    try {
      setError(null)
      await musicService.play(playlistId)
      setCurrentPlaylist(musicService.getCurrentPlaylist())
      setCurrentTrack(musicService.getCurrentTrack())
      setIsPlaying(musicService.isTrackPlaying())
    } catch (error) {
      console.error('Failed to switch playlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to switch playlist')
    }
  }

  const handleNextTrack = async () => {
    try {
      setError(null)
      await musicService.nextTrack()
      setCurrentTrack(musicService.getCurrentTrack())
      setIsPlaying(musicService.isTrackPlaying())
    } catch (error) {
      console.error('Failed to play next track:', error)
      setError(error instanceof Error ? error.message : 'Failed to play next track')
    }
  }

  const handlePreviousTrack = async () => {
    try {
      setError(null)
      await musicService.previousTrack()
      setCurrentTrack(musicService.getCurrentTrack())
      setIsPlaying(musicService.isTrackPlaying())
    } catch (error) {
      console.error('Failed to play previous track:', error)
      setError(error instanceof Error ? error.message : 'Failed to play previous track')
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'spotify': return '🎵'
      case 'youtube': return '📺'
      case 'soundcloud': return '☁️'
      case 'direct': return '🎧'
      default: return '🎶'
    }
  }

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'spotify': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'youtube': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'soundcloud': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'direct': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const handleAddTrack = async () => {
    if (!newTrackUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    try {
      setError(null)
      await musicService.addTrack(
        newTrackUrl.trim(),
        newTrackTitle.trim() || undefined,
        newTrackArtist.trim() || undefined
      )

      // Reset form
      setNewTrackUrl('')
      setNewTrackTitle('')
      setNewTrackArtist('')
      setShowAddTrack(false)

      // Refresh playlists
      setCurrentPlaylist(musicService.getCurrentPlaylist())
    } catch (error) {
      console.error('Failed to add track:', error)
      setError(error instanceof Error ? error.message : 'Failed to add track')
    }
  }

  const handleRemoveTrack = (trackId: string) => {
    try {
      setError(null)
      musicService.removeTrack(trackId)
      setCurrentPlaylist(musicService.getCurrentPlaylist())

      // If removed track was current, stop playback
      if (currentTrack?.id === trackId) {
        musicService.stop()
        setCurrentTrack(null)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('Failed to remove track:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove track')
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration

    musicService.seekTo(newTime)
  }

  return (
    <div className="glass-card p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Music className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Focus Music</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentPlaylist?.name || 'No playlist selected'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 rounded-lg transition-colors ${
              showPlaylist ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle Playlist"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          🎵 <strong>Music Player</strong> - Supports Spotify, YouTube, SoundCloud, and direct audio URLs. Add your own tracks below!
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Music Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Music</span>
              <button
                onClick={handleEnableToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.enabled ? 'transform translate-x-5' : ''
                }`} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Volume: {settings.volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Now Playing */}
      {currentTrack && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{getSourceIcon(currentTrack.sourceType)}</span>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{currentTrack.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentTrack.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(currentTrack.sourceType)}`}>
                {currentTrack.sourceType}
              </span>
              {currentTrack.url && (
                <a
                  href={currentTrack.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-200"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePreviousTrack}
              disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!settings.enabled}
              className="p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            <button
              onClick={handleNextTrack}
              disabled={!currentPlaylist || currentPlaylist.tracks.length <= 1}
              className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleVolumeChange(settings.volume > 0 ? 0 : 50)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {settings.volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3ch]">
            {settings.volume}%
          </span>
        </div>
      </div>

      {/* Embedded Player */}
      {currentIframe && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">External Player</h4>
          <div
            className="w-full rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentIframe.outerHTML }}
          />
        </div>
      )}

      {/* Add Track Form */}
      {showAddTrack && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Track</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                URL (Spotify, YouTube, SoundCloud, or direct audio)
              </label>
              <input
                type="url"
                value={newTrackUrl}
                onChange={(e) => setNewTrackUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={newTrackTitle}
                  onChange={(e) => setNewTrackTitle(e.target.value)}
                  placeholder="Track title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Artist (optional)
                </label>
                <input
                  type="text"
                  value={newTrackArtist}
                  onChange={(e) => setNewTrackArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddTrack}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Track
              </button>
              <button
                onClick={() => setShowAddTrack(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Selection */}
      {showPlaylist && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white">Playlists</h4>
            <button
              onClick={() => setShowAddTrack(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Track
            </button>
          </div>
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handlePlaylistSelect(playlist.id)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  currentPlaylist?.id === playlist.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">{playlist.name}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{playlist.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {playlist.tracks.length} tracks
                    </p>
                  </div>
                  {playlist.isDefault && (
                    <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Track List */}
          {currentPlaylist && (
            <div className="mt-6">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                {currentPlaylist.name} Tracks
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentPlaylist.tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`p-3 rounded-lg transition-colors ${
                      currentTrack?.id === track.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleTrackSelect(track.id)}
                        className="flex items-center gap-3 flex-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700/30 rounded p-2 -m-2 transition-colors"
                      >
                        <span className="text-lg">{getSourceIcon(track.sourceType)}</span>
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900 dark:text-white text-sm">{track.title}</h6>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{track.artist}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${getSourceColor(track.sourceType)}`}>
                            {track.sourceType}
                          </span>
                          {track.duration && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {formatTime(track.duration)}
                            </p>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-1">
                        {track.url && (
                          <a
                            href={track.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {track.isUserAdded && (
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                            title="Remove track"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MusicPlayer