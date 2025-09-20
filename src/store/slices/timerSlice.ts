import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerState, TimerMode, TimerStatus } from '../../types/timer'
import { generateId } from '../../utils/helpers'

const initialState: TimerState = {
  mode: 'work',
  status: 'idle',
  timeRemaining: 25 * 60, // 25 minutes in seconds
  totalTime: 25 * 60,
  cycleCount: 0,
  completedPomodoros: 0,
  currentSessionId: '',
}

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.status = 'running'
      if (!state.currentSessionId) {
        state.currentSessionId = generateId()
      }
    },
    pauseTimer: (state) => {
      state.status = 'paused'
    },
    resumeTimer: (state) => {
      state.status = 'running'
    },
    resetTimer: (state) => {
      state.status = 'idle'
      state.timeRemaining = state.totalTime
      state.currentSessionId = ''
    },
    tick: (state) => {
      if (state.status === 'running' && state.timeRemaining > 0) {
        state.timeRemaining -= 1
      }
      if (state.timeRemaining === 0) {
        state.status = 'completed'
      }
    },
    switchMode: (state, action: PayloadAction<TimerMode>) => {
      state.mode = action.payload
      state.status = 'idle'
      state.currentSessionId = ''

      // Set appropriate duration based on mode
      switch (action.payload) {
        case 'work':
          state.totalTime = 25 * 60 // 25 minutes
          break
        case 'shortBreak':
          state.totalTime = 5 * 60 // 5 minutes
          break
        case 'longBreak':
          state.totalTime = 15 * 60 // 15 minutes
          break
      }
      state.timeRemaining = state.totalTime
    },
    completeSession: (state) => {
      if (state.mode === 'work') {
        state.completedPomodoros += 1
        state.cycleCount += 1
      }
      state.status = 'completed'
    },
    skipSession: (state) => {
      state.status = 'completed'
      state.currentSessionId = ''
    },
    updateDuration: (state, action: PayloadAction<{ mode: TimerMode; duration: number }>) => {
      const { mode, duration } = action.payload
      if (state.mode === mode) {
        state.totalTime = duration * 60 // convert minutes to seconds
        state.timeRemaining = duration * 60
      }
    },
  },
})

export const {
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  tick,
  switchMode,
  completeSession,
  skipSession,
  updateDuration,
} = timerSlice.actions

export default timerSlice.reducer