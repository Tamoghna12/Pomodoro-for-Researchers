import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TimerSettings } from '../../types/timer'

interface SettingsState extends TimerSettings {
  darkMode: boolean
  notifications: boolean
}

const initialState: SettingsState = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  soundEnabled: true,
  soundVolume: 0.5,
  darkMode: false,
  notifications: true,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload)
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    updateWorkDuration: (state, action: PayloadAction<number>) => {
      state.workDuration = action.payload
    },
    updateShortBreakDuration: (state, action: PayloadAction<number>) => {
      state.shortBreakDuration = action.payload
    },
    updateLongBreakDuration: (state, action: PayloadAction<number>) => {
      state.longBreakDuration = action.payload
    },
    toggleAutoStart: (state, action: PayloadAction<'breaks' | 'work'>) => {
      if (action.payload === 'breaks') {
        state.autoStartBreaks = !state.autoStartBreaks
      } else {
        state.autoStartWork = !state.autoStartWork
      }
    },
    updateSoundSettings: (state, action: PayloadAction<{ enabled?: boolean; volume?: number }>) => {
      if (action.payload.enabled !== undefined) {
        state.soundEnabled = action.payload.enabled
      }
      if (action.payload.volume !== undefined) {
        state.soundVolume = action.payload.volume
      }
    },
  },
})

export const {
  updateSettings,
  toggleDarkMode,
  updateWorkDuration,
  updateShortBreakDuration,
  updateLongBreakDuration,
  toggleAutoStart,
  updateSoundSettings,
} = settingsSlice.actions

export default settingsSlice.reducer