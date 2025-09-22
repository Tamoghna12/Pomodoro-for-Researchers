import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import SessionStats from '../SessionStats'
import EnhancedSessionStats from '../EnhancedSessionStats'
import FocusInsights from '../FocusInsights'
import ResearchAnalytics from '../ResearchAnalytics'
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  BookOpen,
  Brain,
  Award,
  Filter,
  Download,
  Activity
} from 'lucide-react'

interface Session {
  id: string
  date: string
  type: 'literature-review' | 'data-analysis' | 'writing' | 'deep-work' | 'break'
  duration: number
  completed: boolean
  goal?: string
  productivity?: number
}

interface Goal {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'project'
  target: number
  current: number
  deadline?: string
}

const AnalyticsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'goals' | 'insights' | 'statistics'>('overview')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')

  // Mock data - in real app this would come from Redux store
  const sessions: Session[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'literature-review',
      duration: 25,
      completed: true,
      goal: 'Review 5 ML papers',
      productivity: 85
    },
    {
      id: '2',
      date: '2024-01-15',
      type: 'data-analysis',
      duration: 45,
      completed: true,
      goal: 'Clean dataset',
      productivity: 92
    },
    {
      id: '3',
      date: '2024-01-14',
      type: 'writing',
      duration: 30,
      completed: false,
      goal: 'Write introduction',
      productivity: 65
    }
  ]

  const goals: Goal[] = [
    {
      id: '1',
      title: 'Complete Literature Review',
      type: 'project',
      target: 50,
      current: 32,
      deadline: '2024-02-01'
    },
    {
      id: '2',
      title: 'Daily Focus Time',
      type: 'daily',
      target: 4,
      current: 2.5
    },
    {
      id: '3',
      title: 'Weekly Research Hours',
      type: 'weekly',
      target: 25,
      current: 18
    }
  ]

  const completedSessions = sessions.filter(s => s.completed)
  const totalFocusTime = completedSessions.reduce((acc, s) => acc + s.duration, 0)
  const averageProductivity = completedSessions.reduce((acc, s) => acc + (s.productivity || 0), 0) / completedSessions.length

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'literature-review': return <BookOpen className="w-4 h-4" />
      case 'data-analysis': return <BarChart3 className="w-4 h-4" />
      case 'writing': return <Target className="w-4 h-4" />
      case 'deep-work': return <Brain className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'literature-review': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'data-analysis': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'writing': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'deep-work': return 'bg-amber-100 text-amber-700 border-amber-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedSessions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(totalFocusTime)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Focus Time</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(averageProductivity)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Score</div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {goals.filter(g => (g.current / g.target) >= 1).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goals Met</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <EnhancedSessionStats />

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Research Sessions
        </h3>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${getSessionTypeColor(session.type)}`}>
                  {getSessionTypeIcon(session.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session.goal || session.type.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.date).toLocaleDateString()} • {formatDuration(session.duration)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {session.productivity && (
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {session.productivity}%
                  </div>
                )}
                <div className={`w-3 h-3 rounded-full ${
                  session.completed ? 'bg-emerald-500' : 'bg-yellow-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Research Sessions
        </h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="glass-card p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg border ${getSessionTypeColor(session.type)}`}>
                  {getSessionTypeIcon(session.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.goal || session.type.replace('-', ' ')}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getSessionTypeColor(session.type)}`}>
                      {session.type.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(session.duration)}
                    </div>
                    {session.productivity && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4" />
                        {session.productivity}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                session.completed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
                {session.completed ? 'Completed' : 'Interrupted'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Research Goals
        </h3>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="glass-card p-4 rounded-lg">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{goal.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  goal.type === 'daily' ? 'bg-blue-100 text-blue-700' :
                  goal.type === 'weekly' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {goal.type}
                </span>
              </div>
              {goal.deadline && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((goal.current / goal.target) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Research Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Insights into your research productivity and progress
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sessions', label: 'Sessions', icon: Clock },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'insights', label: 'Insights', icon: Brain },
            { id: 'statistics', label: 'Statistics', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'sessions' && renderSessions()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'insights' && <FocusInsights maxInsights={10} />}
      {activeTab === 'statistics' && <ResearchAnalytics />}
    </div>
  )
}

export default AnalyticsSection