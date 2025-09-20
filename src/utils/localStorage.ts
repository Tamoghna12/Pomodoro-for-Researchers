import { DailyStats } from '../types/timer'

const STORAGE_KEYS = {
  TIMER_SETTINGS: 'pomodoro_timer_settings',
  DAILY_STATS: 'pomodoro_daily_stats',
  APP_SETTINGS: 'pomodoro_app_settings',
  TIMER_STATE: 'pomodoro_timer_state',
} as const

export interface StoredTimerState {
  mode: string
  timeRemaining: number
  totalTime: number
  cycleCount: number
  completedPomodoros: number
  lastUpdated: string
}

export class LocalStorageManager {
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error)
    }
  }

  static clear(): void {
    try {
      // Only clear our app's keys, not everything
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// Timer Settings
export const saveTimerSettings = (settings: any) => {
  LocalStorageManager.setItem(STORAGE_KEYS.TIMER_SETTINGS, settings)
}

export const loadTimerSettings = () => {
  return LocalStorageManager.getItem(STORAGE_KEYS.TIMER_SETTINGS, {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    soundVolume: 0.5,
  })
}

// App Settings
export const saveAppSettings = (settings: any) => {
  LocalStorageManager.setItem(STORAGE_KEYS.APP_SETTINGS, settings)
}

export const loadAppSettings = () => {
  return LocalStorageManager.getItem(STORAGE_KEYS.APP_SETTINGS, {
    darkMode: false,
    notifications: true,
  })
}

// Daily Stats
export const saveDailyStats = (stats: DailyStats[]) => {
  LocalStorageManager.setItem(STORAGE_KEYS.DAILY_STATS, stats)
}

export const loadDailyStats = (): DailyStats[] => {
  return LocalStorageManager.getItem(STORAGE_KEYS.DAILY_STATS, [])
}

// Timer State (for persistence across page reloads)
export const saveTimerState = (state: any) => {
  const timerState: StoredTimerState = {
    mode: state.mode,
    timeRemaining: state.timeRemaining,
    totalTime: state.totalTime,
    cycleCount: state.cycleCount,
    completedPomodoros: state.completedPomodoros,
    lastUpdated: new Date().toISOString(),
  }
  LocalStorageManager.setItem(STORAGE_KEYS.TIMER_STATE, timerState)
}

export const loadTimerState = (): StoredTimerState | null => {
  const stored = LocalStorageManager.getItem<StoredTimerState | null>(STORAGE_KEYS.TIMER_STATE, null)

  if (!stored) return null

  // Check if stored state is recent (within 1 hour)
  const lastUpdated = new Date(stored.lastUpdated)
  const now = new Date()
  const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

  if (hoursDiff > 1) {
    // State is too old, don't restore
    LocalStorageManager.removeItem(STORAGE_KEYS.TIMER_STATE)
    return null
  }

  return stored
}

export const clearTimerState = () => {
  LocalStorageManager.removeItem(STORAGE_KEYS.TIMER_STATE)
}

// Export/Import functionality
export const exportData = () => {
  const data = {
    timerSettings: loadTimerSettings(),
    appSettings: loadAppSettings(),
    dailyStats: loadDailyStats(),
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pomodoro-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importData = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validate data structure
        if (!data.timerSettings || !data.appSettings || !Array.isArray(data.dailyStats)) {
          throw new Error('Invalid data format')
        }

        // Import data
        saveTimerSettings(data.timerSettings)
        saveAppSettings(data.appSettings)
        saveDailyStats(data.dailyStats)

        resolve(true)
      } catch (error) {
        console.error('Error importing data:', error)
        resolve(false)
      }
    }

    reader.readAsText(file)
  })
}