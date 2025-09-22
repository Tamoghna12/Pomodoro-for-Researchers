import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Brain,
  Zap,
  Activity,
  PieChart,
  LineChart,
  Award,
  AlertCircle
} from 'lucide-react'

interface StatisticalMetrics {
  mean: number
  median: number
  standardDeviation: number
  variance: number
  coefficient: number // coefficient of variation
  trend: 'increasing' | 'decreasing' | 'stable'
  reliability: number // consistency score 0-100
}

interface ProductivityPattern {
  timeOfDay: string
  avgProductivity: number
  sessionCount: number
  confidenceInterval: [number, number]
}

interface ResearchPhaseEfficiency {
  phase: string
  avgDuration: number
  completionRate: number
  efficiency: number
}

const ResearchAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')
  const [analysisType, setAnalysisType] = useState<'overview' | 'patterns' | 'efficiency' | 'trends'>('overview')

  // Mock data - in production, this would come from Redux store
  const sessionData = [
    { date: '2024-01-15', duration: 25, type: 'literature-review', productivity: 85, completed: true },
    { date: '2024-01-15', duration: 45, type: 'data-analysis', productivity: 92, completed: true },
    { date: '2024-01-14', duration: 30, type: 'writing', productivity: 78, completed: true },
    { date: '2024-01-14', duration: 25, type: 'literature-review', productivity: 88, completed: true },
    { date: '2024-01-13', duration: 60, type: 'data-analysis', productivity: 95, completed: true },
    { date: '2024-01-13', duration: 25, type: 'writing', productivity: 82, completed: false },
    { date: '2024-01-12', duration: 35, type: 'literature-review', productivity: 90, completed: true },
    { date: '2024-01-12', duration: 50, type: 'data-analysis', productivity: 87, completed: true }
  ]

  // Statistical calculations
  const calculateStatistics = (values: number[]): StatisticalMetrics => {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const sortedValues = [...values].sort((a, b) => a - b)
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)]

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const standardDeviation = Math.sqrt(variance)
    const coefficient = mean > 0 ? (standardDeviation / mean) * 100 : 0

    // Simple trend calculation (last 3 vs first 3 values)
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

    const trend = secondAvg > firstAvg + standardDeviation ? 'increasing' :
                  secondAvg < firstAvg - standardDeviation ? 'decreasing' : 'stable'

    const reliability = Math.max(0, 100 - coefficient)

    return { mean, median, standardDeviation, variance, coefficient, trend, reliability }
  }

  const productivityStats = useMemo(() => {
    const completedSessions = sessionData.filter(s => s.completed)
    const productivityValues = completedSessions.map(s => s.productivity)
    return calculateStatistics(productivityValues)
  }, [sessionData])

  const durationStats = useMemo(() => {
    const completedSessions = sessionData.filter(s => s.completed)
    const durationValues = completedSessions.map(s => s.duration)
    return calculateStatistics(durationValues)
  }, [sessionData])

  const completionRate = useMemo(() => {
    return (sessionData.filter(s => s.completed).length / sessionData.length) * 100
  }, [sessionData])

  const phaseEfficiency = useMemo((): ResearchPhaseEfficiency[] => {
    const phases = ['literature-review', 'data-analysis', 'writing']
    return phases.map(phase => {
      const phaseSessions = sessionData.filter(s => s.type === phase)
      const completed = phaseSessions.filter(s => s.completed)
      const avgDuration = completed.reduce((sum, s) => sum + s.duration, 0) / completed.length || 0
      const completionRate = (completed.length / phaseSessions.length) * 100 || 0
      const avgProductivity = completed.reduce((sum, s) => sum + s.productivity, 0) / completed.length || 0
      const efficiency = (completionRate * avgProductivity) / 100

      return {
        phase: phase.replace('-', ' '),
        avgDuration,
        completionRate,
        efficiency
      }
    })
  }, [sessionData])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 80) return 'text-green-600 dark:text-green-400'
    if (reliability >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatStatValue = (value: number, unit: string = '') => {
    return `${value.toFixed(1)}${unit}`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Productivity</h4>
            {getTrendIcon(productivityStats.trend)}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatStatValue(productivityStats.mean, '%')}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Median:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatStatValue(productivityStats.median, '%')}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">σ:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatStatValue(productivityStats.standardDeviation, '%')}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Consistency: </span>
              <span className={`text-xs font-medium ${getReliabilityColor(productivityStats.reliability)}`}>
                {formatStatValue(productivityStats.reliability, '%')}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Session Duration</h4>
            {getTrendIcon(durationStats.trend)}
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatStatValue(durationStats.mean, 'm')}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Median:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatStatValue(durationStats.median, 'm')}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">CV:</span>
                <span className="ml-1 text-gray-900 dark:text-white">{formatStatValue(durationStats.coefficient, '%')}</span>
              </div>
            </div>
            <div className="pt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Reliability: </span>
              <span className={`text-xs font-medium ${getReliabilityColor(durationStats.reliability)}`}>
                {formatStatValue(durationStats.reliability, '%')}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Completion Rate</h4>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatStatValue(completionRate, '%')}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {sessionData.filter(s => s.completed).length} of {sessionData.length} sessions completed
            </div>
          </div>
        </div>
      </div>

      {/* Research Phase Efficiency */}
      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Research Phase Efficiency</h4>
        <div className="space-y-4">
          {phaseEfficiency.map((phase) => (
            <div key={phase.phase} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {phase.phase}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatStatValue(phase.efficiency)} efficiency score
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Avg Duration:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatStatValue(phase.avgDuration, 'm')}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatStatValue(phase.completionRate, '%')}</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(phase.efficiency, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistical Insights */}
      <div className="glass-card p-6 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Statistical Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Productivity Variance</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your productivity has a standard deviation of {formatStatValue(productivityStats.standardDeviation, '%')},
                  indicating {productivityStats.coefficient < 15 ? 'high consistency' :
                             productivityStats.coefficient < 30 ? 'moderate consistency' : 'high variability'} in performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Optimal Session Length</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on your data, sessions around {formatStatValue(durationStats.median, ' minutes')}
                  show the best balance of completion rate and productivity.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Best Performing Phase</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {phaseEfficiency.sort((a, b) => b.efficiency - a.efficiency)[0]?.phase} shows
                  your highest efficiency at {formatStatValue(phaseEfficiency.sort((a, b) => b.efficiency - a.efficiency)[0]?.efficiency)} score.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Improvement Opportunity</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Focus on improving {phaseEfficiency.sort((a, b) => a.efficiency - b.efficiency)[0]?.phase}
                  sessions to boost overall research productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Research Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Statistical analysis of your research productivity</p>
        </div>

        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {[
            { id: 'overview', label: 'Statistical Overview', icon: BarChart3 },
            { id: 'patterns', label: 'Patterns', icon: Activity },
            { id: 'efficiency', label: 'Efficiency', icon: Target },
            { id: 'trends', label: 'Trends', icon: LineChart }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setAnalysisType(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium text-sm transition-colors ${
                  analysisType === tab.id
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

      {/* Content */}
      {analysisType === 'overview' && renderOverview()}
      {analysisType === 'patterns' && (
        <div className="glass-card p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Productivity Patterns</h4>
          <p className="text-gray-600 dark:text-gray-400">Pattern analysis coming soon...</p>
        </div>
      )}
      {analysisType === 'efficiency' && (
        <div className="glass-card p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Efficiency Analysis</h4>
          <p className="text-gray-600 dark:text-gray-400">Efficiency analysis coming soon...</p>
        </div>
      )}
      {analysisType === 'trends' && (
        <div className="glass-card p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Trend Analysis</h4>
          <p className="text-gray-600 dark:text-gray-400">Trend analysis coming soon...</p>
        </div>
      )}
    </div>
  )
}

export default ResearchAnalytics