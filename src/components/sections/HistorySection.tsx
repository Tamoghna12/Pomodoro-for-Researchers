import React, { useState } from 'react'
import { Calendar, Clock, Target, TrendingUp, Filter } from 'lucide-react'

interface Session {
  id: string
  date: string
  duration: number
  type: 'work' | 'break'
  completed: boolean
}

const HistorySection: React.FC = () => {
  // Mock data - in real app this would come from Redux store
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      date: '2024-01-15',
      duration: 25,
      type: 'work',
      completed: true
    },
    {
      id: '2',
      date: '2024-01-15',
      duration: 5,
      type: 'break',
      completed: true
    },
    {
      id: '3',
      date: '2024-01-15',
      duration: 22,
      type: 'work',
      completed: false
    },
    {
      id: '4',
      date: '2024-01-14',
      duration: 25,
      type: 'work',
      completed: true
    },
    {
      id: '5',
      date: '2024-01-14',
      duration: 25,
      type: 'work',
      completed: true
    },
  ])

  const [filter, setFilter] = useState<'all' | 'work' | 'break'>('all')

  const filteredSessions = sessions.filter(session =>
    filter === 'all' || session.type === filter
  )

  const totalSessions = sessions.filter(s => s.type === 'work').length
  const completedSessions = sessions.filter(s => s.type === 'work' && s.completed).length
  const totalFocusTime = sessions
    .filter(s => s.type === 'work' && s.completed)
    .reduce((acc, s) => acc + s.duration, 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const groupSessionsByDate = (sessions: Session[]) => {
    const groups: { [key: string]: Session[] } = {}
    sessions.forEach(session => {
      if (!groups[session.date]) {
        groups[session.date] = []
      }
      groups[session.date].push(session)
    })
    return groups
  }

  const groupedSessions = groupSessionsByDate(filteredSessions)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session History</h2>
        <p className="text-gray-600 dark:text-gray-400">Track your focus sessions and progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedSessions}/{totalSessions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</div>
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
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Focus Time</div>
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
                {Math.round((completedSessions / totalSessions) * 100)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'work', 'break'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {filterType === 'all' ? 'All' : filterType === 'work' ? 'Focus' : 'Break'}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {Object.entries(groupedSessions)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, sessions]) => (
            <div key={date} className="glass-card p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              <div className="grid gap-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        session.type === 'work'
                          ? session.completed
                            ? 'bg-emerald-500'
                            : 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.type === 'work' ? '🎯 Focus Session' : '☕ Break'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{formatDuration(session.duration)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.completed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {session.completed ? 'Completed' : 'Interrupted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Daily Summary */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Daily Total:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(
                      sessions
                        .filter(s => s.type === 'work' && s.completed)
                        .reduce((acc, s) => acc + s.duration, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No sessions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start your first focus session to see your progress here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistorySection