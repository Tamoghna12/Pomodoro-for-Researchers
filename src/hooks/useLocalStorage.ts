import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { updateSettings } from '../store/slices/settingsSlice'
import { updateDailyStats } from '../store/slices/statsSlice'
import {
  saveTimerSettings,
  loadTimerSettings,
  saveAppSettings,
  loadAppSettings,
  saveDailyStats,
  loadDailyStats,
  saveTimerState,
  loadTimerState,
  clearTimerState,
} from '../utils/localStorage'

export const useLocalStorage = () => {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)
  const stats = useSelector((state: RootState) => state.stats)
  const timer = useSelector((state: RootState) => state.timer)

  // Load initial data on mount
  useEffect(() => {
    const loadInitialData = () => {
      // Load timer and app settings
      const timerSettings = loadTimerSettings()
      const appSettings = loadAppSettings()

      dispatch(updateSettings({
        ...timerSettings,
        ...appSettings,
      }))

      // Load daily stats
      const dailyStats = loadDailyStats()
      dispatch(updateDailyStats(dailyStats))

      // Load timer state if recent
      const timerState = loadTimerState()
      if (timerState) {
        // TODO: Restore timer state if needed
        // This would require additional actions in the timer slice
        console.log('Found recent timer state:', timerState)
      }
    }

    loadInitialData()
  }, [dispatch])

  // Save settings when they change
  useEffect(() => {
    const timerSettings = {
      workDuration: settings.workDuration,
      shortBreakDuration: settings.shortBreakDuration,
      longBreakDuration: settings.longBreakDuration,
      longBreakInterval: settings.longBreakInterval,
      autoStartBreaks: settings.autoStartBreaks,
      autoStartWork: settings.autoStartWork,
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume,
    }

    const appSettings = {
      darkMode: settings.darkMode,
      notifications: settings.notifications,
    }

    saveTimerSettings(timerSettings)
    saveAppSettings(appSettings)
  }, [settings])

  // Save daily stats when they change
  useEffect(() => {
    saveDailyStats(stats.dailyStats)
  }, [stats.dailyStats])

  // Save timer state periodically when running
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timer.status === 'running') {
      // Save timer state every 10 seconds when running
      interval = setInterval(() => {
        saveTimerState(timer)
      }, 10000)

      // Save immediately when starting
      saveTimerState(timer)
    } else if (timer.status === 'completed' || timer.status === 'idle') {
      // Clear timer state when completed or idle
      clearTimerState()
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timer.status, timer])

  // Save timer state when page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (timer.status === 'running' || timer.status === 'paused') {
        saveTimerState(timer)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [timer])

  return {
    clearAllData: () => {
      if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        localStorage.clear()
        window.location.reload()
      }
    },
  }
}