import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { tick, completeSession, switchMode } from '../store/slices/timerSlice'
import { startSession, completeSession as completeStatsSession } from '../store/slices/statsSlice'
import { formatTime, getNextMode, generateId } from '../utils/helpers'
import { TimerMode, SessionData } from '../types/timer'

const Timer: React.FC = () => {
  const dispatch = useDispatch()
  const timer = useSelector((state: RootState) => state.timer)
  const settings = useSelector((state: RootState) => state.settings)

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timer.status === 'running') {
      interval = setInterval(() => {
        dispatch(tick())
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timer.status, dispatch])

  // Handle session completion
  useEffect(() => {
    if (timer.status === 'completed') {
      // Complete the current session in stats
      if (timer.currentSessionId) {
        dispatch(completeStatsSession({
          sessionId: timer.currentSessionId,
          completed: true
        }))
      }

      // Complete the session in timer
      dispatch(completeSession())

      // Auto-switch to next mode if enabled
      const nextMode = getNextMode(timer.mode, timer.cycleCount, settings.longBreakInterval) as TimerMode

      setTimeout(() => {
        dispatch(switchMode(nextMode))

        // Auto-start next session if enabled
        const shouldAutoStart =
          (nextMode !== 'work' && settings.autoStartBreaks) ||
          (nextMode === 'work' && settings.autoStartWork)

        if (shouldAutoStart) {
          const sessionData: SessionData = {
            id: generateId(),
            startTime: new Date(),
            mode: nextMode,
            duration: getDurationForMode(nextMode, settings),
            completed: false,
            interrupted: false,
          }
          dispatch(startSession(sessionData))
        }
      }, 1000)
    }
  }, [timer.status, timer.currentSessionId, timer.mode, timer.cycleCount, settings, dispatch])

  const getModeColor = () => {
    switch (timer.mode) {
      case 'work':
        return 'text-primary-600 dark:text-primary-400'
      case 'shortBreak':
        return 'text-success-600 dark:text-success-400'
      case 'longBreak':
        return 'text-warning-600 dark:text-warning-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getModeTitle = () => {
    switch (timer.mode) {
      case 'work':
        return 'Focus Time'
      case 'shortBreak':
        return 'Short Break'
      case 'longBreak':
        return 'Long Break'
      default:
        return 'Timer'
    }
  }

  const getStatusText = () => {
    switch (timer.status) {
      case 'running':
        return 'In Progress'
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Completed!'
      default:
        return 'Ready to Start'
    }
  }

  return (
    <div className="text-center space-y-6">
      {/* Mode Title */}
      <div>
        <h2 className={`text-2xl font-bold ${getModeColor()}`}>
          {getModeTitle()}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {getStatusText()}
        </p>
      </div>

      {/* Timer Display */}
      <div className={`timer-display ${getModeColor()} ${
        timer.status === 'running' ? 'animate-pulse-slow' : ''
      }`}>
        {formatTime(timer.timeRemaining)}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            timer.mode === 'work'
              ? 'bg-primary-600'
              : timer.mode === 'shortBreak'
              ? 'bg-success-600'
              : 'bg-warning-600'
          }`}
          style={{
            width: `${((timer.totalTime - timer.timeRemaining) / timer.totalTime) * 100}%`,
          }}
        />
      </div>

      {/* Session Info */}
      <div className="flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900 dark:text-white">
            {timer.completedPomodoros}
          </div>
          <div>Completed Today</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900 dark:text-white">
            {timer.cycleCount}
          </div>
          <div>Current Cycle</div>
        </div>
      </div>
    </div>
  )
}

function getDurationForMode(mode: TimerMode, settings: any): number {
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

export default Timer