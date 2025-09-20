import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  Clock,
  Lightbulb,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Plus,
  Search
} from 'lucide-react'
import { ResearchSessionType, RESEARCH_SESSION_TYPES } from '../types/research'

interface ResearchSessionSelectorProps {
  onSelectSession: (sessionType: ResearchSessionType, customDuration?: number) => void
  onClose: () => void
}

const ResearchSessionSelector: React.FC<ResearchSessionSelectorProps> = ({
  onSelectSession,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<ResearchSessionType | null>(null)
  const [customDuration, setCustomDuration] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const settings = useSelector((state: RootState) => state.settings)
  const stats = useSelector((state: RootState) => state.stats)

  const filteredTypes = Object.entries(RESEARCH_SESSION_TYPES).filter(([key, config]) =>
    config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
      green: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      purple: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-200',
      orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200',
      gray: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/20 dark:border-gray-700 dark:text-gray-200',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-200',
      teal: 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-200',
      red: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      pink: 'bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-200',
      violet: 'bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-200',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
    }
    return colorMap[color] || colorMap.gray
  }

  const handleStart = () => {
    if (selectedType) {
      onSelectSession(selectedType, customDuration || undefined)
    }
  }

  const getMostUsedTypes = () => {
    // This would come from stats in a real implementation
    return ['literature-review', 'writing', 'data-analysis'].slice(0, 3) as ResearchSessionType[]
  }

  const getRecommendedDuration = (type: ResearchSessionType) => {
    const baseMinutes = RESEARCH_SESSION_TYPES[type].suggestedDuration
    // Adjust based on user's typical session length
    const userAverage = stats.totalTimeToday > 0 ? stats.totalTimeToday / (stats.sessionsToday || 1) / 60 : 25
    return Math.round((baseMinutes + userAverage) / 2)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-xl max-w-4xl w-full h-full sm:max-h-[90vh] sm:h-auto overflow-hidden mobile-modal">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                What are you working on today?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your research activity to get optimized timing and AI assistance
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mobile-tap-target ml-2"
            >
              ×
            </button>
          </div>

          {/* Search */}
          <div className="mt-3 sm:mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row h-full sm:h-[60vh]">
          {/* Session Types List */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            {/* Quick Access */}
            {!searchTerm && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Most Used
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {getMostUsedTypes().map((type) => {
                    const config = RESEARCH_SESSION_TYPES[type]
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-2 sm:p-3 rounded-lg border transition-all mobile-tap-target ${
                          selectedType === type
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="text-xl sm:text-2xl mb-1">{config.icon}</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {config.name}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Activities */}
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {searchTerm ? 'Search Results' : 'All Research Activities'}
              </h3>
              <div className="space-y-1 sm:space-y-2">
                {filteredTypes.map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as ResearchSessionType)}
                    className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left mobile-tap-target ${
                      selectedType === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl">{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                            {config.name}
                          </h4>
                          <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full border ${getColorClasses(config.color)}`}>
                            {config.suggestedDuration}m
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Session Details & Configuration */}
          <div className="w-full sm:w-80 bg-gray-50 dark:bg-gray-900 p-3 sm:p-6 border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700">
            {selectedType ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Selected Activity */}
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="text-2xl sm:text-3xl">
                      {RESEARCH_SESSION_TYPES[selectedType].icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {RESEARCH_SESSION_TYPES[selectedType].name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Optimized for your workflow
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duration Settings */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Session Duration
                  </label>

                  <div className="space-y-2">
                    {/* Recommended */}
                    <button
                      onClick={() => {
                        setCustomDuration(null)
                        setShowCustom(false)
                      }}
                      className={`w-full p-2 sm:p-3 rounded-lg border transition-all mobile-tap-target ${
                        !showCustom && !customDuration
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                          <span className="text-xs sm:text-sm font-medium">Recommended</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {getRecommendedDuration(selectedType)}m
                        </span>
                      </div>
                    </button>

                    {/* Standard Pomodoro */}
                    <button
                      onClick={() => {
                        setCustomDuration(settings.workDuration)
                        setShowCustom(false)
                      }}
                      className={`w-full p-2 sm:p-3 rounded-lg border transition-all mobile-tap-target ${
                        customDuration === settings.workDuration
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-xs sm:text-sm font-medium">Standard</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {settings.workDuration}m
                        </span>
                      </div>
                    </button>

                    {/* Custom */}
                    <button
                      onClick={() => setShowCustom(true)}
                      className={`w-full p-2 sm:p-3 rounded-lg border transition-all mobile-tap-target ${
                        showCustom
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                          <span className="text-xs sm:text-sm font-medium">Custom</span>
                        </div>
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </div>
                    </button>

                    {showCustom && (
                      <div className="mt-2">
                        <input
                          type="number"
                          min="5"
                          max="180"
                          value={customDuration || ''}
                          onChange={(e) => setCustomDuration(parseInt(e.target.value) || null)}
                          placeholder="Minutes"
                          className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Assistance Preview */}
                <div className="hidden sm:block">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Assistance Available
                  </h4>
                  <div className="space-y-1 sm:space-y-2">
                    {RESEARCH_SESSION_TYPES[selectedType].aiPrompts.slice(0, 2).map((prompt, index) => (
                      <div key={index} className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400">"{prompt}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="hidden sm:block">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pro Tips
                  </h4>
                  <div className="space-y-1">
                    {RESEARCH_SESSION_TYPES[selectedType].tips.slice(0, 2).map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStart}
                  className="w-full p-3 sm:p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 mobile-tap-target"
                >
                  Start Session
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Select a research activity to see details and recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResearchSessionSelector