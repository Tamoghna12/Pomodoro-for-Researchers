import React, { useState } from 'react'
import {
  Target,
  Plus,
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Flag,
  Trophy,
  Zap,
  BookOpen,
  BarChart3
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'project'
  category: 'focus-time' | 'sessions' | 'research' | 'writing' | 'custom'
  target: number
  current: number
  unit: string
  deadline?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'paused'
  createdAt: Date
  completedAt?: Date
}

const GoalsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<'all' | Goal['category']>('all')

  // Mock goals data
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Daily Focus Time',
      description: 'Maintain 4 hours of focused work daily',
      type: 'daily',
      category: 'focus-time',
      target: 240,
      current: 180,
      unit: 'minutes',
      priority: 'high',
      status: 'active',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'Complete Literature Review',
      description: 'Review 50 research papers for thesis',
      type: 'project',
      category: 'research',
      target: 50,
      current: 32,
      unit: 'papers',
      deadline: new Date('2024-02-15'),
      priority: 'high',
      status: 'active',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      title: 'Weekly Pomodoros',
      description: 'Complete 25 focus sessions each week',
      type: 'weekly',
      category: 'sessions',
      target: 25,
      current: 18,
      unit: 'sessions',
      priority: 'medium',
      status: 'active',
      createdAt: new Date('2024-01-08')
    },
    {
      id: '4',
      title: 'Research Methodology Chapter',
      description: 'Complete methodology chapter draft',
      type: 'project',
      category: 'writing',
      target: 5000,
      current: 5000,
      unit: 'words',
      deadline: new Date('2024-01-10'),
      priority: 'high',
      status: 'completed',
      createdAt: new Date('2023-12-15'),
      completedAt: new Date('2024-01-10')
    }
  ])

  const filteredGoals = goals.filter(goal => {
    const matchesStatus = activeTab === 'all' || goal.status === activeTab
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory
    return matchesStatus && matchesCategory
  })

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100)
  }

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
    }
  }

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'focus-time':
        return <Clock className="w-4 h-4" />
      case 'sessions':
        return <Target className="w-4 h-4" />
      case 'research':
        return <BookOpen className="w-4 h-4" />
      case 'writing':
        return <Edit className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: Goal['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'weekly':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'monthly':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'project':
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date()
    const timeDiff = deadline.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalProgress = activeGoals.reduce((acc, goal) => acc + getProgressPercentage(goal), 0) / activeGoals.length || 0

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h2>
          <p className="text-gray-600 dark:text-gray-400">Set and track your productivity goals</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{activeGoals.length}</div>
            <div className="text-xs text-gray-500">Active Goals</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{completedGoals.length}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">{Math.round(totalProgress)}%</div>
            <div className="text-xs text-gray-500">Avg Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-lg font-bold text-emerald-600">
              {activeGoals.filter(g => g.deadline && getDaysUntilDeadline(g.deadline) <= 7).length}
            </div>
            <div className="text-xs text-gray-500">Due This Week</div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            {(['active', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="focus-time">Focus Time</option>
              <option value="sessions">Sessions</option>
              <option value="research">Research</option>
              <option value="writing">Writing</option>
              <option value="custom">Custom</option>
            </select>

            <button
              onClick={() => setShowAddGoal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getCategoryIcon(goal.category)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flag className={`w-4 h-4 ${getPriorityColor(goal.priority)}`} />
                {goal.status === 'completed' && (
                  <Trophy className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(goal.type)}`}>
                {goal.type}
              </span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                {goal.category.replace('-', ' ')}
              </span>
              {goal.deadline && (
                <span className={`px-2 py-1 text-xs rounded ${
                  getDaysUntilDeadline(goal.deadline) <= 3
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : getDaysUntilDeadline(goal.deadline) <= 7
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {getDaysUntilDeadline(goal.deadline)} days left
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {goal.current} / {goal.target} {goal.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.status === 'completed'
                      ? 'bg-green-500'
                      : getProgressPercentage(goal) >= 80
                      ? 'bg-emerald-500'
                      : getProgressPercentage(goal) >= 50
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage(goal)}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Math.round(getProgressPercentage(goal))}% complete
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created {goal.createdAt.toLocaleDateString()}
                {goal.completedAt && (
                  <span> • Completed {goal.completedAt.toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No goals found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filterCategory !== 'all' || activeTab !== 'active'
              ? 'Try adjusting your filters'
              : 'Set your first goal to start tracking your progress'}
          </p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Goal
          </button>
        </div>
      )}

      {/* Add Goal Modal Placeholder */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Goal</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Goal creation form would go here with fields for title, description, type, target, etc.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsSection