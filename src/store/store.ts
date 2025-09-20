import { configureStore } from '@reduxjs/toolkit'
import timerReducer from './slices/timerSlice'
import settingsReducer from './slices/settingsSlice'
import statsReducer from './slices/statsSlice'
import aiReducer from './slices/aiSlice'

export const store = configureStore({
  reducer: {
    timer: timerReducer,
    settings: settingsReducer,
    stats: statsReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch