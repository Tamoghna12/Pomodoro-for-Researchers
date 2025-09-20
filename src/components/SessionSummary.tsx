import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { analyzeCurrentSession } from '../store/slices/aiSlice'
import {
  BarChart3,
  Clock,
  Target,
  Brain,
  TrendingUp,
  Award,
  Calendar,
  Lightbulb,
  Download,
  Share2,
  X
} from 'lucide-react'
import { formatTime } from '../utils/helpers'

interface SessionSummaryProps {
  isOpen: boolean
  onClose: () => void
  sessionData?: {
    totalTime: number
    completedPomodoros: number
    breaksTaken: number
    startTime: Date
    endTime: Date
    focusAreas?: string[]
    notes?: string[]
  }
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  isOpen,
  onClose,
  sessionData
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const { ai, stats, timer } = useSelector((state: RootState) => state)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    if (isOpen && sessionData && ai.enabled) {
      handleAnalyzeSession()
    }
  }, [isOpen, sessionData, ai.enabled])

  const handleAnalyzeSession = async () => {
    if (!sessionData || !ai.enabled) return

    setIsAnalyzing(true)
    try {
      const analysisData = {
        ...sessionData,
        totalSessions: stats.sessionsToday,
        weeklyAverage: stats.weeklyStats.reduce((sum, day) => sum + day.sessions, 0) / 7,
        currentStreak: stats.currentStreak,
        researchContext: ai.researchContext
      }

      const result = await dispatch(analyzeCurrentSession(analysisData) as any).unwrap()
      setSummary(result)
    } catch (error) {
      console.error('Session analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateProductivityScore = () => {
    if (!sessionData) return 0
    const completionRate = sessionData.completedPomodoros / (sessionData.completedPomodoros + sessionData.breaksTaken || 1)
    const timeEfficiency = sessionData.totalTime / (sessionData.totalTime + (sessionData.breaksTaken * 5 * 60) || 1)
    return Math.min(100, Math.round((completionRate * 0.6 + timeEfficiency * 0.4) * 100))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
  }

  const exportSummary = () => {
    if (!sessionData) return

    const exportData = {
      session: sessionData,
      aiAnalysis: summary,
      productivity: calculateProductivityScore(),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomodoro-session-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Session Summary</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {sessionData?.startTime && new Date(sessionData.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportSummary}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                title="Export Summary"
              >
                <Download className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Session Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Time</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessionData ? formatTime(sessionData.totalTime) : '0:00'}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessionData?.completedPomodoros || 0}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Breaks</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sessionData?.breaksTaken || 0}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score</span>
                </div>
                <div className={`text-2xl font-bold inline-flex items-center px-3 py-1 rounded-full ${getScoreColor(calculateProductivityScore())}`}>
                  {calculateProductivityScore()}%
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {ai.enabled && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
                  </div>
                </div>

                <div className="p-4">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing your session...</span>
                    </div>
                  ) : summary ? (
                    <div className="space-y-4">
                      {/* AI Insights */}
                      {summary.aiInsights && summary.aiInsights.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Insights
                          </h4>
                          <div className="space-y-2">
                            {summary.aiInsights.map((insight: string, index: number) => (
                              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-800 dark:text-blue-200">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Research Topics */}
                      {summary.researchTopics && summary.researchTopics.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Research Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {summary.researchTopics.map((topic: string, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {summary.suggestions && summary.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Suggestions</h4>
                          <ul className="space-y-2">
                            {summary.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        No AI analysis available
                      </p>
                      <button
                        onClick={handleAnalyzeSession}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Analyze Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Session Timeline</h3>
                <div className="space-y-3">
                  {sessionData?.startTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Started</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sessionData.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sessionData?.completedPomodoros || 0} Pomodoros Completed
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sessionData?.breaksTaken || 0} breaks taken
                      </div>
                    </div>
                  </div>

                  {sessionData?.endTime && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Ended</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sessionData.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Focus Areas</h3>
                {sessionData?.focusAreas && sessionData.focusAreas.length > 0 ? (
                  <div className="space-y-2">
                    {sessionData.focusAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : ai.researchContext.focusAreas.length > 0 ? (
                  <div className="space-y-2">
                    {ai.researchContext.focusAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No specific focus areas recorded for this session
                  </p>
                )}
              </div>
            </div>

            {/* Session Notes */}
            {(sessionData?.notes && sessionData.notes.length > 0) || ai.researchContext.sessionNotes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Session Notes</h3>
                <div className="space-y-2">
                  {(sessionData?.notes || ai.researchContext.sessionNotes).map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-750 rounded border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Session completed • {sessionData?.endTime ? new Date(sessionData.endTime).toLocaleString() : 'In progress'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportSummary}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SessionSummary