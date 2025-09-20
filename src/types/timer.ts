export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  timeRemaining: number
  totalTime: number
  cycleCount: number
  completedPomodoros: number
  currentSessionId: string
}

export interface TimerSettings {
  workDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // after how many work sessions
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
  soundVolume: number
}

export interface SessionData {
  id: string
  startTime: Date
  endTime?: Date
  mode: TimerMode
  duration: number
  completed: boolean
  interrupted: boolean
}

export interface DailyStats {
  date: string
  completedPomodoros: number
  totalFocusTime: number // in minutes
  totalBreakTime: number // in minutes
  sessions: SessionData[]
}