import React, { useState } from 'react'
import {
  Calendar,
  Clock,
  Target,
  Search,
  MoreVertical,
  Play,
  CheckCircle,
  XCircle,
  BarChart3,
  Trash2,
  Edit
} from 'lucide-react'

interface Session {
  id: string
  title: string
  type: 'focus' | 'break' | 'deep-work' | 'research'
  duration: number
  actualDuration: number
  startTime: Date
  endTime?: Date
  status: 'completed' | 'interrupted' | 'in-progress'
  tags: string[]
  notes?: string
  productivity?: number
}

const SessionsSection: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'interrupted'>('all')
  const [filterType, setFilterType] = useState<'all' | 'focus' | 'break' | 'deep-work' | 'research'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Mock sessions data - in real app this would come from Redux store
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      title: 'Literature Review: Machine Learning',
      type: 'research',
      duration: 45,
      actualDuration: 42,
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T09:42:00'),
      status: 'completed',
      tags: ['ML', 'Literature'],
      notes: 'Reviewed 12 papers on transformer architectures',
      productivity: 85
    },
    {
      id: '2',
      title: 'Deep Work: Data Analysis',
      type: 'deep-work',
      duration: 90,
      actualDuration: 78,
      startTime: new Date('2024-01-15T10:30:00'),
      endTime: new Date('2024-01-15T11:48:00'),
      status: 'completed',
      tags: ['Analysis', 'Python'],
      productivity: 92
    },
    {
      id: '3',
      title: 'Writing Session',
      type: 'focus',
      duration: 25,
      actualDuration: 18,
      startTime: new Date('2024-01-15T14:00:00'),
      status: 'interrupted',
      tags: ['Writing'],
      notes: 'Interrupted by phone call'
    },
    {
      id: '4',
      title: 'Current Research Session',
      type: 'research',
      duration: 60,
      actualDuration: 23,
      startTime: new Date(),
      status: 'in-progress',
      tags: ['Active']
    }
  ])

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesType = filterType === 'all' || session.type === filterType
    const matchesSearch = !searchQuery ||
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDate = !selectedDate ||
      session.startTime.toISOString().split('T')[0] === selectedDate

    return matchesStatus && matchesType && matchesSearch && matchesDate
  })

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'interrupted':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeColor = (type: Session['type']) => {
    switch (type) {
      case 'focus':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'break':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deep-work':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'research':
        return 'bg-amber-100 text-amber-800 border-amber-200'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => s.status === 'completed').length
  const totalFocusTime = sessions
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + s.actualDuration, 0)
  const avgProductivity = sessions
    .filter(s => s.productivity)
    .reduce((acc, s, _, arr) => acc + (s.productivity! / arr.length), 0)

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h2>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your focus sessions</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-3">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{totalSessions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
          <div className="glass-card p-3">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{completedSessions}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="glass-card p-3">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatDuration(totalFocusTime)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Focus Time</div>
          </div>
          <div className="glass-card p-3">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{Math.round(avgProductivity)}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="interrupted">Interrupted</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="focus">Focus</option>
            <option value="break">Break</option>
            <option value="deep-work">Deep Work</option>
            <option value="research">Research</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(session.status)}
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {session.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(session.type)}`}>
                    {session.type.replace('-', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {session.startTime.toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {session.endTime && ` - ${session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {formatDuration(session.actualDuration)} / {formatDuration(session.duration)}
                  </div>
                  {session.productivity && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {session.productivity}%
                    </div>
                  )}
                </div>

                {session.tags.length > 0 && (
                  <div className="flex gap-2 mb-2">
                    {session.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {session.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {session.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress bar for completed sessions */}
            {session.status === 'completed' && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Session Progress</span>
                  <span>{Math.round((session.actualDuration / session.duration) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((session.actualDuration / session.duration) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all' || selectedDate
                ? 'Try adjusting your filters or search query'
                : 'Start your first focus session to see it here'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionsSection