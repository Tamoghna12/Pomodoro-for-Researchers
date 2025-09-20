import React from 'react'
import { useSelector } from 'react-redux'
import { Clock, Target, TrendingUp, Calendar } from 'lucide-react'
import { RootState } from '../store/store'
import { formatDuration, formatTime } from '../utils/helpers'
import { formatDateForDisplay, isToday } from '../utils/dateHelpers'

const SessionStats: React.FC = () => {
  const stats = useSelector((state: RootState) => state.stats)
  const timer = useSelector((state: RootState) => state.timer)

  const todayStats = stats.dailyStats.find(day => isToday(new Date(day.date)))
  const todayPomodoros = todayStats?.completedPomodoros || 0
  const todayFocusTime = todayStats?.totalFocusTime || 0

  const weeklyPomodoros = stats.dailyStats
    .filter(day => {
      const dayDate = new Date(day.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return dayDate >= weekAgo
    })
    .reduce((sum, day) => sum + day.completedPomodoros, 0)

  return (
    <div className="space-y-6">
      {/* Today's Progress */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Progress
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pomodoros</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {todayPomodoros}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                <Clock className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Focus Time</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(todayFocusTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.streak} days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          This Week
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Total Pomodoros</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {weeklyPomodoros}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Daily Average</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.round(weeklyPomodoros / 7 * 10) / 10}
            </span>
          </div>
        </div>
      </div>

      {/* Current Session */}
      {timer.status === 'running' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Session
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Mode</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {timer.mode.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Time Elapsed</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatTime(timer.totalTime - timer.timeRemaining)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(((timer.totalTime - timer.timeRemaining) / timer.totalTime) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {todayStats && todayStats.sessions.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sessions
          </h3>

          <div className="space-y-2">
            {todayStats.sessions
              .slice(-3)
              .reverse()
              .map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.mode === 'work'
                        ? 'bg-primary-500'
                        : session.mode === 'shortBreak'
                        ? 'bg-success-500'
                        : 'bg-warning-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {session.mode.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(session.duration)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.completed
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {session.completed ? 'Done' : 'Skipped'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionStats