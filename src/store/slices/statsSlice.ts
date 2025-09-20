import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SessionData, DailyStats } from '../../types/timer'
import { formatDate } from '../../utils/dateHelpers'

interface StatsState {
  dailyStats: DailyStats[]
  currentSession: SessionData | null
  totalCompletedPomodoros: number
  totalFocusTime: number // in minutes
  streak: number // consecutive days with at least one completed pomodoro
}

const initialState: StatsState = {
  dailyStats: [],
  currentSession: null,
  totalCompletedPomodoros: 0,
  totalFocusTime: 0,
  streak: 0,
}

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<SessionData>) => {
      state.currentSession = action.payload
    },

    completeSession: (state, action: PayloadAction<{ sessionId: string; completed: boolean }>) => {
      if (!state.currentSession || state.currentSession.id !== action.payload.sessionId) {
        return
      }

      const session = {
        ...state.currentSession,
        endTime: new Date(),
        completed: action.payload.completed,
        interrupted: !action.payload.completed,
      }

      const today = formatDate(new Date())
      let dailyStats = state.dailyStats.find(stats => stats.date === today)

      if (!dailyStats) {
        dailyStats = {
          date: today,
          completedPomodoros: 0,
          totalFocusTime: 0,
          totalBreakTime: 0,
          sessions: [],
        }
        state.dailyStats.push(dailyStats)
      }

      dailyStats.sessions.push(session)

      if (session.completed) {
        if (session.mode === 'work') {
          dailyStats.completedPomodoros += 1
          dailyStats.totalFocusTime += session.duration
          state.totalCompletedPomodoros += 1
          state.totalFocusTime += session.duration
        } else {
          dailyStats.totalBreakTime += session.duration
        }
      }

      state.currentSession = null

      // Update streak
      state.streak = calculateStreak(state.dailyStats)
    },

    updateDailyStats: (state, action: PayloadAction<DailyStats[]>) => {
      state.dailyStats = action.payload
    },

    resetStats: (state) => {
      state.dailyStats = []
      state.totalCompletedPomodoros = 0
      state.totalFocusTime = 0
      state.streak = 0
      state.currentSession = null
    },
  },
})

function calculateStreak(dailyStats: DailyStats[]): number {
  if (dailyStats.length === 0) return 0

  // Sort by date descending
  const sortedStats = [...dailyStats].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  let streak = 0
  const today = new Date()

  for (let i = 0; i < sortedStats.length; i++) {
    const statDate = new Date(sortedStats[i].date)
    const daysDiff = Math.floor((today.getTime() - statDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === i && sortedStats[i].completedPomodoros > 0) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export const {
  startSession,
  completeSession,
  updateDailyStats,
  resetStats,
} = statsSlice.actions

export default statsSlice.reducer