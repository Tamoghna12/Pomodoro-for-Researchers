import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Timer from '../Timer'
import Controls from '../Controls'
import ResearchSessionSelector from '../ResearchSessionSelector'
import SessionSummary from '../SessionSummary'
import { Calendar, Target, PlayCircle, PauseCircle, RotateCcw } from 'lucide-react'
import { ResearchSessionType, RESEARCH_SESSION_TYPES } from '../../types/research'

interface TimerSectionProps {
  onSessionComplete?: (sessionData: Record<string, any>) => void
}

const TimerSection: React.FC<TimerSectionProps> = ({ onSessionComplete }) => {
  const timer = useSelector((state: RootState) => state.timer)
  const [showSessionSelector, setShowSessionSelector] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [sessionSummaryData, setSessionSummaryData] = useState<Record<string, any> | null>(null)
  const [currentSessionType, setCurrentSessionType] = useState<ResearchSessionType | null>(null)

  const handleSessionSelect = (sessionType: ResearchSessionType, customDuration?: number) => {
    setCurrentSessionType(sessionType)
    setShowSessionSelector(false)
    // TODO: Start timer with session type and custom duration
  }

  const handleShowSessionSummary = (sessionData: Record<string, any>) => {
    setSessionSummaryData(sessionData)
    setShowSessionSummary(true)
    if (onSessionComplete) {
      onSessionComplete(sessionData)
    }
  }

  const quickTimerPresets = [
    { duration: 25, label: '25m Focus', color: 'green', description: 'Classic Pomodoro' },
    { duration: 45, label: '45m Deep Work', color: 'blue', description: 'Extended focus' },
    { duration: 15, label: '15m Review', color: 'purple', description: 'Quick review' },
    { duration: 90, label: '90m Research', color: 'orange', description: 'Deep research' }
  ]

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Timer Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Focus Timer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enhance your research productivity with structured focus sessions
          </p>
        </div>

        {/* Current Session Info */}
        {currentSessionType && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{RESEARCH_SESSION_TYPES[currentSessionType].icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                    {RESEARCH_SESSION_TYPES[currentSessionType].name}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {RESEARCH_SESSION_TYPES[currentSessionType].description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSessionSelector(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Change Session
              </button>
            </div>
          </div>
        )}

        {/* Main Timer */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-12 border border-gray-200/50 dark:border-gray-700/50 text-center shadow-2xl">
          <div className="mb-8">
            <Timer />
          </div>

          <div className="mb-8">
            <Controls onSessionComplete={handleShowSessionSummary} />
          </div>

          {/* Timer Status */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {timer.isRunning ? (
                <PauseCircle className="w-4 h-4 text-green-500" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              <span>{timer.isRunning ? 'Session Active' : 'Ready to Start'}</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Round {timer.completedPomodoros + 1}</span>
            </div>
          </div>
        </div>

        {/* Quick Timer Presets */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center">
            Quick Start
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickTimerPresets.map((preset, index) => (
              <button
                key={index}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105
                  bg-${preset.color}-50 dark:bg-${preset.color}-900/20
                  border-${preset.color}-200 dark:border-${preset.color}-700/50
                  hover:bg-${preset.color}-100 dark:hover:bg-${preset.color}-900/30
                  text-${preset.color}-700 dark:text-${preset.color}-300
                `}
              >
                <div className="text-2xl font-bold mb-1">{preset.duration}</div>
                <div className="text-sm font-medium mb-1">{preset.label}</div>
                <div className="text-xs opacity-75">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Type Selector */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Research Session Type
            </h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>

          <button
            onClick={() => setShowSessionSelector(true)}
            className="w-full p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-all group"
          >
            <div className="flex items-center justify-center gap-3 text-blue-700 dark:text-blue-300 mb-2">
              <Target className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-semibold">
                {currentSessionType
                  ? `Continue: ${RESEARCH_SESSION_TYPES[currentSessionType].name}`
                  : 'What are you working on today?'
                }
              </span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {currentSessionType
                ? RESEARCH_SESSION_TYPES[currentSessionType].description
                : 'Choose your research activity for optimized timing and AI assistance'
              }
            </p>
          </button>
        </div>

        {/* Modals */}
        {showSessionSelector && (
          <ResearchSessionSelector
            onSelectSession={handleSessionSelect}
            onClose={() => setShowSessionSelector(false)}
          />
        )}

        <SessionSummary
          isOpen={showSessionSummary}
          onClose={() => setShowSessionSummary(false)}
          sessionData={sessionSummaryData}
        />
      </div>
    </div>
  )
}

export default TimerSection