import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import Timer from '../Timer'
import Controls from '../Controls'
import SessionStats from '../SessionStats'
import FocusInsights from '../FocusInsights'
import QuickQuery from '../QuickQuery'
import ResearchAssistant from '../ResearchAssistant'
import { Brain, Clock, Target, TrendingUp, Calendar, Search } from 'lucide-react'

interface DashboardSectionProps {
  onSessionComplete?: (sessionData: Record<string, any>) => void
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ onSessionComplete }) => {
  const timer = useSelector((state: RootState) => state.timer)
  const stats = useSelector((state: RootState) => state.stats)
  const ai = useSelector((state: RootState) => state.ai)

  const todayStats = {
    completedSessions: stats.totalSessions,
    focusTime: Math.floor(stats.totalFocusTime / 60),
    productivity: 85,
    streak: 3
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, Researcher! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to dive deep into your research with focused productivity?
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                Focus Session #{todayStats.completedSessions + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today's Focus</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {todayStats.focusTime}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {todayStats.completedSessions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Productivity</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {todayStats.productivity}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {todayStats.streak} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <Timer />
              <div className="mt-6">
                <Controls onSessionComplete={onSessionComplete} />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <Search className="w-6 h-6" />
                  <span className="font-semibold">Quick Research</span>
                </div>
                <p className="text-sm text-blue-100">
                  Get instant answers to your research questions
                </p>
              </button>

              <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-6 h-6" />
                  <span className="font-semibold">AI Assistant</span>
                </div>
                <p className="text-sm text-purple-100">
                  Deep dive with AI-powered research support
                </p>
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <SessionStats />
            <FocusInsights maxInsights={3} />

            {/* Recent AI Activity */}
            {ai.enabled && ai.recentQueries.length > 0 && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Recent AI Queries
                </h3>
                <div className="space-y-2">
                  {ai.recentQueries.slice(0, 3).map((query) => (
                    <div key={query.id} className="p-3 bg-gray-50/80 dark:bg-gray-750/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {query.query}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {query.response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSection