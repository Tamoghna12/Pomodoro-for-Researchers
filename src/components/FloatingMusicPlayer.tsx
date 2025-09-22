import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  ExternalLink,
  Shuffle,
  Repeat,
  Heart,
  MoreHorizontal,
  Minimize2,
  Maximize2,
  X,
  Move,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface Track {
  id: string
  title: string
  artist: string
  album?: string
  duration: number
  image?: string
  url?: string
}

interface FloatingMusicPlayerProps {
  onClose: () => void
}

const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({ onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeService, setActiveService] = useState<'spotify' | 'youtube' | 'soundcloud' | null>(null)

  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const playerRef = useRef<HTMLDivElement>(null)

  // Sample current track
  useEffect(() => {
    setCurrentTrack({
      id: '1',
      title: 'Concentration Flow',
      artist: 'Focus Sounds',
      album: 'Deep Work Sessions',
      duration: 245,
      image: '🎵'
    })
    setIsConnected(true)
    setActiveService('spotify')
  }, [])

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return // Don't allow dragging when minimized
    setIsDragging(true)
    const rect = playerRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Keep within viewport bounds
    const maxX = window.innerWidth - (playerRef.current?.offsetWidth || 0)
    const maxY = window.innerHeight - (playerRef.current?.offsetHeight || 0)

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    // Snap to edges if close enough
    const snapDistance = 50
    const playerWidth = playerRef.current?.offsetWidth || 0
    const playerHeight = playerRef.current?.offsetHeight || 0

    let newX = position.x
    let newY = position.y

    // Snap to left or right edge
    if (position.x < snapDistance) {
      newX = 20
    } else if (position.x > window.innerWidth - playerWidth - snapDistance) {
      newX = window.innerWidth - playerWidth - 20
    }

    // Snap to top or bottom edge
    if (position.y < snapDistance) {
      newY = 20
    } else if (position.y > window.innerHeight - playerHeight - snapDistance) {
      newY = window.innerHeight - playerHeight - 20
    }

    setPosition({ x: newX, y: newY })
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMinimized) return
    setIsDragging(true)
    const touch = e.touches[0]
    const rect = playerRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      })
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]

    const newX = touch.clientX - dragOffset.x
    const newY = touch.clientY - dragOffset.y

    const maxX = window.innerWidth - (playerRef.current?.offsetWidth || 0)
    const maxY = window.innerHeight - (playerRef.current?.offsetHeight || 0)

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    // Same snapping logic as mouse
    const snapDistance = 50
    const playerWidth = playerRef.current?.offsetWidth || 0
    const playerHeight = playerRef.current?.offsetHeight || 0

    let newX = position.x
    let newY = position.y

    if (position.x < snapDistance) {
      newX = 20
    } else if (position.x > window.innerWidth - playerWidth - snapDistance) {
      newX = window.innerWidth - playerWidth - 20
    }

    if (position.y < snapDistance) {
      newY = 20
    } else if (position.y > window.innerHeight - playerHeight - snapDistance) {
      newY = window.innerHeight - playerHeight - 20
    }

    setPosition({ x: newX, y: newY })
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, dragOffset])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const connectToSpotify = () => {
    setActiveService('spotify')
    setIsConnected(true)
  }

  const connectToYouTube = () => {
    setActiveService('youtube')
    setIsConnected(true)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled)
  }

  const toggleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all']
    const currentIndex = modes.indexOf(repeatMode)
    setRepeatMode(modes[(currentIndex + 1) % modes.length])
  }

  // Minimized view - compact floating player
  if (isMinimized && currentTrack && isConnected) {
    return (
      <div
        ref={playerRef}
        className="fixed z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-3xl floating-music-minimized"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '80px',
          height: '80px'
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-2xl mb-1">{currentTrack.image}</div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                togglePlay()
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div
        ref={playerRef}
        className="fixed z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 floating-music-player"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '350px',
          maxWidth: '90vw'
        }}
      >
        {/* Header with drag handle and controls */}
        <div
          className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-2xl cursor-move"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4" />
            <Music className="w-4 h-4" />
            <span className="font-medium text-sm">Music Player</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Connect Music Services */}
        <div className="p-4">
          <div className="text-center mb-4">
            <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Connect Your Music
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Connect to your favorite music service
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={connectToSpotify}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
            >
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <span className="text-green-500 text-xs font-bold">♪</span>
              </div>
              Connect Spotify
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={connectToYouTube}
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm"
            >
              <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                <span className="text-red-500 text-xs font-bold">▶</span>
              </div>
              YouTube Music
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Full floating player
  return (
    <div
      ref={playerRef}
      className="fixed z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 floating-music-player"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '350px',
        maxWidth: '90vw'
      }}
    >
      {/* Header with drag handle and controls */}
      <div
        className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-2xl cursor-move"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <Move className="w-4 h-4" />
          <Music className="w-4 h-4" />
          <span className="font-medium text-sm">Now Playing</span>
          <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Track */}
      {currentTrack && (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center text-xl">
              {currentTrack.image}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                {currentTrack.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 truncate text-xs">
                {currentTrack.artist}
              </p>
            </div>
            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Heart className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div
                className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / currentTrack.duration) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffled
                  ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition-colors ${
                repeatMode !== 'off'
                  ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              {repeatMode === 'one' && (
                <span className="absolute -mt-1 -ml-1 text-xs">1</span>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingMusicPlayer