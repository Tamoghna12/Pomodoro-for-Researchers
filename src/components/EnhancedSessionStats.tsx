import React, { useMemo } from 'react'
import {
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Zap,
  Award,
  Calendar,
  Brain
} from 'lucide-react'

interface StatSummary {
  value: number
  trend: 'up' | 'down' | 'stable'
  change: number
  label: string
  unit: string
}

const EnhancedSessionStats: React.FC = () => {
  // Mock data - in production, this would come from Redux store
  const sessionData = [
    { date: '2024-01-15', duration: 25, productivity: 85, completed: true, type: 'literature-review' },
    { date: '2024-01-15', duration: 45, productivity: 92, completed: true, type: 'data-analysis' },
    { date: '2024-01-14', duration: 30, productivity: 78, completed: true, type: 'writing' },
    { date: '2024-01-14', duration: 25, productivity: 88, completed: true, type: 'literature-review' },
    { date: '2024-01-13', duration: 60, productivity: 95, completed: true, type: 'data-analysis' },
    { date: '2024-01-13', duration: 25, productivity: 82, completed: false, type: 'writing' },
    { date: '2024-01-12', duration: 35, productivity: 90, completed: true, type: 'literature-review' },
    { date: '2024-01-11', duration: 50, productivity: 87, completed: true, type: 'data-analysis' },
    { date: '2024-01-10', duration: 20, productivity: 75, completed: true, type: 'writing' },
    { date: '2024-01-10', duration: 40, productivity: 89, completed: true, type: 'literature-review' }
  ]

  const statisticalSummary = useMemo(() => {
    const completedSessions = sessionData.filter(s => s.completed)
    const recentSessions = completedSessions.slice(0, 5) // Last 5 sessions
    const olderSessions = completedSessions.slice(5, 10) // Previous 5 sessions

    const calculateAverage = (sessions: typeof completedSessions, field: keyof typeof sessions[0]) => {
      return sessions.reduce((sum, session) => sum + (session[field] as number), 0) / sessions.length
    }

    const calculateTrend = (recent: number, older: number): 'up' | 'down' | 'stable' => {
      const change = ((recent - older) / older) * 100
      if (Math.abs(change) < 5) return 'stable'
      return change > 0 ? 'up' : 'down'
    }

    const recentAvgProductivity = calculateAverage(recentSessions, 'productivity')
    const olderAvgProductivity = calculateAverage(olderSessions, 'productivity')

    const recentAvgDuration = calculateAverage(recentSessions, 'duration')
    const olderAvgDuration = calculateAverage(olderSessions, 'duration')

    const totalSessions = completedSessions.length
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0)

    const completionRate = (completedSessions.length / sessionData.length) * 100
    const previousWeekCompletionRate = 85 // Mock previous data

    const focusEfficiency = (totalFocusTime / (totalSessions * 45)) * 100 // Assuming 45min ideal session
    const previousFocusEfficiency = 78 // Mock previous data

    const productivityTrend = calculateTrend(recentAvgProductivity, olderAvgProductivity)
    const durationTrend = calculateTrend(recentAvgDuration, olderAvgDuration)

    return {
      productivity: {
        value: recentAvgProductivity,
        trend: productivityTrend,
        change: ((recentAvgProductivity - olderAvgProductivity) / olderAvgProductivity) * 100,
        label: 'Avg Productivity',
        unit: '%'
      },
      focusTime: {
        value: totalFocusTime,
        trend: 'up' as const,
        change: 12,
        label: 'Total Focus Time',
        unit: 'min'
      },
      sessionDuration: {
        value: recentAvgDuration,
        trend: durationTrend,
        change: ((recentAvgDuration - olderAvgDuration) / olderAvgDuration) * 100,
        label: 'Avg Session Length',
        unit: 'min'
      },
      completionRate: {
        value: completionRate,
        trend: completionRate > previousWeekCompletionRate ? 'up' as const : 'down' as const,
        change: completionRate - previousWeekCompletionRate,
        label: 'Completion Rate',
        unit: '%'
      },
      focusEfficiency: {
        value: focusEfficiency,
        trend: focusEfficiency > previousFocusEfficiency ? 'up' as const : 'down' as const,
        change: focusEfficiency - previousFocusEfficiency,
        label: 'Focus Efficiency',
        unit: '%'
      },
      sessions: {
        value: totalSessions,
        trend: 'up' as const,
        change: 15,
        label: 'Total Sessions',
        unit: ''
      }
    }
  }, [sessionData])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600 dark:text-green-400'
      case 'down': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'min' && value > 60) {
      const hours = Math.floor(value / 60)
      const minutes = Math.round(value % 60)
      return `${hours}h ${minutes}m`
    }
    return `${Math.round(value * 10) / 10}${unit}`
  }

  const StatCard: React.FC<{ stat: StatSummary; icon: React.ReactNode; color: string }> = ({ stat, icon, color }) => (
    <div className="glass-card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(stat.trend)}
          <span className={`text-xs font-medium ${getTrendColor(stat.trend)}`}>
            {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {stat.label}
        </h4>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue(stat.value, stat.unit)}
        </div>
      </div>
    </div>
  )

  const typeDistribution = useMemo(() => {
    const types = ['literature-review', 'data-analysis', 'writing']
    return types.map(type => {
      const typeSessions = sessionData.filter(s => s.type === type && s.completed)
      const totalTime = typeSessions.reduce((sum, s) => sum + s.duration, 0)
      const avgProductivity = typeSessions.reduce((sum, s) => sum + s.productivity, 0) / typeSessions.length || 0

      return {
        type: type.replace('-', ' '),
        sessions: typeSessions.length,
        totalTime,
        avgProductivity: Math.round(avgProductivity),
        percentage: (totalTime / sessionData.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0)) * 100
      }
    })
  }, [sessionData])

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            stat={statisticalSummary.productivity}
            icon={<Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            color="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatCard
            stat={statisticalSummary.focusTime}
            icon={<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            color="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            stat={statisticalSummary.sessionDuration}
            icon={<Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            color="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            stat={statisticalSummary.completionRate}
            icon={<Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            color="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatCard
            stat={statisticalSummary.focusEfficiency}
            icon={<Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            color="bg-orange-100 dark:bg-orange-900/30"
          />
          <StatCard
            stat={statisticalSummary.sessions}
            icon={<BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            color="bg-indigo-100 dark:bg-indigo-900/30"
          />
        </div>
      </div>

      {/* Research Type Distribution */}
      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Research Activity Distribution</h4>
        <div className="space-y-4">
          {typeDistribution.map((type) => (
            <div key={type.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {type.type}
                </span>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>{type.sessions} sessions</span>
                  <span>{formatValue(type.totalTime, 'min')}</span>
                  <span>{type.avgProductivity}% avg</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 to-blue-500"
                  style={{ width: `${type.percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white drop-shadow-sm">
                    {type.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Summary */}
      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Progress Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {sessionData.filter(s => s.completed).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {formatValue(sessionData.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0), 'min')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {Math.round(sessionData.filter(s => s.completed).reduce((sum, s) => sum + s.productivity, 0) / sessionData.filter(s => s.completed).length)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Productivity</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedSessionStats