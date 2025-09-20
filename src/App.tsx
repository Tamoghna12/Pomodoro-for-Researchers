import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store/store'
import Timer from './components/Timer'
import Controls from './components/Controls'
import SessionStats from './components/SessionStats'
import Header from './components/Header'
import ResearchAssistant from './components/ResearchAssistant'
import QuickQuery from './components/QuickQuery'
import FocusInsights from './components/FocusInsights'
import SessionSummary from './components/SessionSummary'
import { useNotifications } from './hooks/useNotifications'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Search, Brain } from 'lucide-react'

function App() {
  const darkMode = useSelector((state: RootState) => state.settings.darkMode)
  // const timer = useSelector((state: RootState) => state.timer)
  const ai = useSelector((state: RootState) => state.ai)

  const [isAssistantMinimized, setIsAssistantMinimized] = useState(true)
  const [showQuickQuery, setShowQuickQuery] = useState(false)
  const [showSessionSummary, setShowSessionSummary] = useState(false)
  const [sessionSummaryData, setSessionSummaryData] = useState<Record<string, any> | null>(null)

  // Initialize notifications and local storage
  useNotifications()
  useLocalStorage()

  const handleShowSessionSummary = (sessionData: Record<string, any>) => {
    setSessionSummaryData(sessionData)
    setShowSessionSummary(true)
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Timer Section */}
              <div className="lg:col-span-2">
                <div className="card p-8 text-center mb-6">
                  <Timer />
                  <Controls onSessionComplete={handleShowSessionSummary} />
                </div>

                {/* Quick Access Research Tools */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setShowQuickQuery(true)}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Quick Query</span>
                    </div>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                      Get instant research answers
                    </p>
                  </button>

                  <button
                    onClick={() => setIsAssistantMinimized(false)}
                    className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                      <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                      Chat with research AI
                    </p>
                  </button>
                </div>

                {/* Research Context */}
                {ai.enabled && ai.researchContext.currentTopic && (
                  <div className="card p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Current Research Topic</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{ai.researchContext.currentTopic}</p>
                    {ai.researchContext.focusAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {ai.researchContext.focusAreas.slice(0, 3).map((area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Statistics and Insights Sidebar */}
              <div className="lg:col-span-2 space-y-6">
                <SessionStats />
                <FocusInsights maxInsights={3} />

                {/* Recent AI Queries */}
                {ai.enabled && ai.recentQueries.length > 0 && (
                  <div className="card p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-500" />
                      Recent Research Queries
                    </h3>
                    <div className="space-y-2">
                      {ai.recentQueries.slice(0, 3).map((query) => (
                        <div key={query.id} className="p-2 bg-gray-50 dark:bg-gray-750 rounded border border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {query.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                            {query.response}
                          </p>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(query.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* AI Components */}
        <ResearchAssistant
          isMinimized={isAssistantMinimized}
          onToggleMinimize={() => setIsAssistantMinimized(!isAssistantMinimized)}
        />

        <QuickQuery
          isVisible={showQuickQuery}
          onClose={() => setShowQuickQuery(false)}
          onToggleAssistant={() => {
            setShowQuickQuery(false)
            setIsAssistantMinimized(false)
          }}
        />

        <SessionSummary
          isOpen={showSessionSummary}
          onClose={() => setShowSessionSummary(false)}
          sessionData={sessionSummaryData}
        />
      </div>
    </div>
  )
}

export default App