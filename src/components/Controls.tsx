import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import { RootState } from '../store/store'
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  skipSession,
  switchMode,
} from '../store/slices/timerSlice'
import { startSession } from '../store/slices/statsSlice'
import { SessionData, TimerMode } from '../types/timer'
import { generateId } from '../utils/helpers'

interface ControlsProps {
  onSessionComplete?: (sessionData: Record<string, any>) => void
}

const Controls: React.FC<ControlsProps> = ({ onSessionComplete }) => {
  const dispatch = useDispatch()
  const timer = useSelector((state: RootState) => state.timer)
  const settings = useSelector((state: RootState) => state.settings)
  // const stats = useSelector((state: RootState) => state.stats)

  // Handle session completion
  useEffect(() => {
    if (timer.status === 'completed' && onSessionComplete) {
      const sessionData = {
        totalTime: timer.totalTime,
        completedPomodoros: timer.completedPomodoros,
        breaksTaken: timer.cycleCount - timer.completedPomodoros,
        startTime: new Date(Date.now() - timer.totalTime * 1000),
        endTime: new Date(),
        mode: timer.mode,
        focusAreas: [], // Could be populated from AI context
        notes: [] // Could be populated from AI context
      }
      onSessionComplete(sessionData)
    }
  }, [timer.status, timer.totalTime, timer.completedPomodoros, timer.cycleCount, timer.mode, onSessionComplete])

  const handleStartPause = () => {
    if (timer.status === 'idle') {
      // Start new session
      const sessionData: SessionData = {
        id: generateId(),
        startTime: new Date(),
        mode: timer.mode,
        duration: getDurationForMode(timer.mode, settings),
        completed: false,
        interrupted: false,
      }

      dispatch(startSession(sessionData))
      dispatch(startTimer())
    } else if (timer.status === 'running') {
      dispatch(pauseTimer())
    } else if (timer.status === 'paused') {
      dispatch(resumeTimer())
    }
  }

  const handleReset = () => {
    dispatch(resetTimer())
  }

  const handleSkip = () => {
    dispatch(skipSession())
  }

  const handleModeSwitch = (mode: TimerMode) => {
    dispatch(switchMode(mode))
  }

  const getStartPauseIcon = () => {
    if (timer.status === 'running') {
      return <Pause className="w-6 h-6" />
    }
    return <Play className="w-6 h-6" />
  }

  const getStartPauseText = () => {
    switch (timer.status) {
      case 'running':
        return 'Pause'
      case 'paused':
        return 'Resume'
      default:
        return 'Start'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleStartPause}
          className="btn-primary flex items-center space-x-2 px-8 py-3 text-lg"
          disabled={timer.status === 'completed'}
        >
          {getStartPauseIcon()}
          <span>{getStartPauseText()}</span>
        </button>

        <button
          onClick={handleReset}
          className="btn-secondary flex items-center space-x-2 px-6 py-3"
          disabled={timer.status === 'idle'}
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleSkip}
          className="btn-secondary flex items-center space-x-2 px-6 py-3"
          disabled={timer.status === 'idle'}
        >
          <SkipForward className="w-5 h-5" />
          <span>Skip</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => handleModeSwitch('work')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timer.mode === 'work'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          disabled={timer.status === 'running'}
        >
          Work
        </button>
        <button
          onClick={() => handleModeSwitch('shortBreak')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timer.mode === 'shortBreak'
              ? 'bg-success-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          disabled={timer.status === 'running'}
        >
          Short Break
        </button>
        <button
          onClick={() => handleModeSwitch('longBreak')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timer.mode === 'longBreak'
              ? 'bg-warning-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          disabled={timer.status === 'running'}
        >
          Long Break
        </button>
      </div>

      {/* Quick Actions */}
      {timer.status === 'completed' && (
        <div className="text-center">
          <p className="text-green-600 dark:text-green-400 font-medium mb-3">
            🎉 Session completed! Great work!
          </p>
          <button
            onClick={() => handleModeSwitch('work')}
            className="btn-primary"
          >
            Start Next Session
          </button>
        </div>
      )}
    </div>
  )
}

function getDurationForMode(mode: TimerMode, settings: Record<string, any>): number {
  switch (mode) {
    case 'work':
      return settings.workDuration
    case 'shortBreak':
      return settings.shortBreakDuration
    case 'longBreak':
      return settings.longBreakDuration
    default:
      return 25
  }
}

export default Controls