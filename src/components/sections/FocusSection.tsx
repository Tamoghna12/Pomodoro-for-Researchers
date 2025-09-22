import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Music, Volume2, VolumeX } from 'lucide-react'

const FocusSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work')
  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicVolume, setMusicVolume] = useState(50)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Switch session type
      if (sessionType === 'work') {
        setSessionType('break')
        setTimeLeft(5 * 60) // 5 minute break
      } else {
        setSessionType('work')
        setTimeLeft(25 * 60) // 25 minute work session
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, sessionType])

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = sessionType === 'work'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Session Type Indicator */}
        <div className="text-center mb-8">
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${
            sessionType === 'work'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          }`}>
            {sessionType === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={`${progress * 2.827} 282.7`}
                className={sessionType === 'work' ? 'text-emerald-500' : 'text-blue-500'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>

          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
          >
            <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Quick Session Options */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button
            onClick={() => {
              setSessionType('work')
              setTimeLeft(15 * 60)
              setIsActive(false)
            }}
            className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            15 min
          </button>
          <button
            onClick={() => {
              setSessionType('work')
              setTimeLeft(25 * 60)
              setIsActive(false)
            }}
            className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-sm font-medium text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            25 min
          </button>
          <button
            onClick={() => {
              setSessionType('work')
              setTimeLeft(45 * 60)
              setIsActive(false)
            }}
            className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            45 min
          </button>
        </div>

        {/* Simple Music Controls */}
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Background Sounds
              </span>
            </div>
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                musicEnabled
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              {musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {musicEnabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[3ch]">
                  {musicVolume}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                  🌧️ Rain
                </button>
                <button className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                  🌊 Ocean
                </button>
                <button className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                  🔥 Fire
                </button>
                <button className="p-2 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-400 transition-colors">
                  🎵 Music
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FocusSection