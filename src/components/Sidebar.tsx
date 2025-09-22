import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import { toggleDarkMode } from '../store/slices/settingsSlice'
import {
  Settings,
  Moon,
  Sun,
  BarChart3,
  Brain,
  User,
  ChevronLeft,
  ChevronRight,
  Bot,
  Search
} from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const dispatch = useDispatch()
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)

  const menuItems = [
    { id: 'workspace', label: 'Research Workspace', icon: Brain, color: 'emerald' },
    { id: 'ai-research', label: 'AI Research Assistant', icon: Bot, color: 'blue' },
    { id: 'search', label: 'Enhanced Search', icon: Search, color: 'purple' },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3, color: 'emerald' },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const baseClasses = isActive
      ? `bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-300 border-${color}-200 dark:border-${color}-700`
      : `text-gray-600 dark:text-gray-400 hover:bg-${color}-50 dark:hover:bg-${color}-900/20 hover:text-${color}-600 dark:hover:text-${color}-400`

    return baseClasses
  }

  return (
    <div className={`
      ${isCollapsed ? 'w-20' : 'w-64'}
      h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
      border-r border-gray-200/50 dark:border-gray-700/50
      transition-all duration-300 ease-in-out
      flex flex-col
      relative z-10
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-green-700 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">Research Flow</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Integrated Productivity</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 border border-transparent
                ${getColorClasses(item.color, isActive)}
                ${isActive ? 'shadow-sm' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Settings Section */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                   text-gray-600 dark:text-gray-400
                   hover:bg-gray-100 dark:hover:bg-gray-800
                   transition-colors duration-200"
          title={isCollapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!isCollapsed && (
            <span className="font-medium text-sm">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => onSectionChange('settings')}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors duration-200
            ${activeSection === 'settings'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-sm">Settings</span>
          )}
        </button>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="pt-2 mt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Research Mode
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Ready to Focus
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar