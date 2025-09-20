import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Moon, Sun, Settings } from 'lucide-react'
import { RootState } from '../store/store'
import { toggleDarkMode } from '../store/slices/settingsSlice'

const Header: React.FC = () => {
  const dispatch = useDispatch()
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Pomodoro for Researchers
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Focus • Research • Achieve
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Open settings"
            >
              <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header