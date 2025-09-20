import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { generateInsights, dismissInsight } from '../store/slices/aiSlice'
import {
  Lightbulb,
  Brain,
  TrendingUp,
  Coffee,
  Target,
  X,
  Sparkles,
  Clock,
  BookOpen
} from 'lucide-react'

interface FocusInsightsProps {
  showAll?: boolean
  maxInsights?: number
}

const FocusInsights: React.FC<FocusInsightsProps> = ({
  showAll = false,
  maxInsights = 3
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { ai, stats, timer } = useSelector((state: RootState) => state)

  useEffect(() => {
    // Generate insights based on session data when AI is enabled
    if (ai.enabled && stats.sessionsToday > 0) {
      const sessionData = {
        sessionsToday: stats.sessionsToday,
        totalTimeToday: stats.totalTimeToday,
        averageSessionLength: stats.totalTimeToday / stats.sessionsToday,
        currentStreak: stats.currentStreak,
        weeklyStats: stats.weeklyStats,
        timerStatus: timer.status,
        currentMode: timer.mode
      }

      dispatch(generateInsights(sessionData) as any)
    }
  }, [dispatch, ai.enabled, stats.sessionsToday, stats.totalTimeToday])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity-tip':
        return <TrendingUp className="w-4 h-4" />
      case 'break-suggestion':
        return <Coffee className="w-4 h-4" />
      case 'session-analysis':
        return <Target className="w-4 h-4" />
      case 'research-pattern':
        return <BookOpen className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'productivity-tip':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'break-suggestion':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
      case 'session-analysis':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20'
      case 'research-pattern':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
      default:
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const visibleInsights = showAll
    ? ai.focusInsights
    : ai.focusInsights.slice(0, maxInsights)

  if (!ai.enabled) {
    return (
      <div className="card p-6 text-center">
        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Insights</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enable AI to get personalized productivity insights and research suggestions
        </p>
        <div className="text-xs text-gray-400">
          Configure AI in Research Assistant settings
        </div>
      </div>
    )
  }

  if (visibleInsights.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Focus Insights</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Complete some Pomodoro sessions to get AI-powered insights about your productivity patterns
        </p>
        {timer.status === 'running' && (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400">
            <Clock className="w-3 h-3" />
            <span>Analyzing your current session...</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showAll && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Focus Insights</h3>
          </div>
          {ai.focusInsights.length > maxInsights && (
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              View All ({ai.focusInsights.length})
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {visibleInsights.map((insight) => (
          <div
            key={insight.id}
            className="card p-4 border-l-4 border-l-blue-500 relative group"
          >
            <button
              onClick={() => dispatch(dismissInsight(insight.id))}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                {getInsightIcon(insight.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {insight.title}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {insight.type.replace('-', ' ')}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {insight.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatTimeAgo(insight.timestamp)}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>{Math.round(insight.relevanceScore * 100)}% relevant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ai.isLoading && (
        <div className="card p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Generating new insights...</span>
          </div>
        </div>
      )}

      {showAll && ai.focusInsights.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No insights available yet. Complete some Pomodoro sessions to get started.
          </p>
        </div>
      )}
    </div>
  )
}

export default FocusInsights