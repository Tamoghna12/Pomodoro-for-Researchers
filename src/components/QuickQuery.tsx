import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { sendQuickQuery } from '../store/slices/aiSlice'
import { Search, X, Clock, Lightbulb, BookOpen, Brain } from 'lucide-react'

interface QuickQueryProps {
  isVisible: boolean
  onClose: () => void
  onToggleAssistant?: () => void
}

const SUGGESTED_QUERIES = [
  "Explain this concept in simple terms",
  "What are the key research methodologies for this topic?",
  "Find recent papers on this subject",
  "Summarize the main theories in this field",
  "What are common research gaps in this area?",
  "Suggest next steps for my research",
]

const QuickQuery: React.FC<QuickQueryProps> = ({ isVisible, onClose, onToggleAssistant }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { ai, timer } = useSelector((state: RootState) => state)

  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = async (queryText?: string) => {
    const queryToSend = queryText || query.trim()
    if (!queryToSend || ai.isLoading) return

    try {
      await dispatch(sendQuickQuery(queryToSend)).unwrap()
      setQuery('')
      setShowSuggestions(false)
    } catch (error) {
      console.error('Quick query failed:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-2xl sm:mx-4 sm:inset-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 h-full sm:h-auto mobile-modal sm:mobile-modal-override">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Quick Research Query</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  Get instant answers without interrupting your focus
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mobile-tap-target"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* AI Status */}
          <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${ai.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {ai.enabled ? `AI Ready (${ai.settings?.provider})` : 'AI Not Configured'}
                </span>
              </div>
              {timer.status === 'running' && (
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <Clock className="w-3 h-3" />
                  <span>Focus Mode Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
            {!ai.enabled ? (
              <div className="text-center py-6 sm:py-8">
                <Brain className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white mb-2">AI Not Configured</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                  Configure your AI settings to use Quick Query
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={onToggleAssistant}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm mobile-tap-target"
                  >
                    Open AI Settings
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm mobile-tap-target"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Query Input */}
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a research question... (Press Enter to submit, Esc to close)"
                    className="w-full p-3 sm:p-4 text-sm sm:text-base text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    autoFocus
                    disabled={ai.isLoading}
                  />
                  {ai.isLoading && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-700 bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Processing query...
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3 sm:gap-0">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mobile-tap-target"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                  </button>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mobile-tap-target"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!query.trim() || ai.isLoading}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium mobile-tap-target"
                    >
                      Submit Query
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Suggested Research Queries
                    </h4>
                    <div className="grid gap-2">
                      {SUGGESTED_QUERIES.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubmit(suggestion)}
                          disabled={ai.isLoading}
                          className="text-left p-2 sm:p-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors disabled:opacity-50 mobile-tap-target"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Queries */}
                {ai.recentQueries.length > 0 && (
                  <div className="mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      Recent Queries
                    </h4>
                    <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                      {ai.recentQueries.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                            {item.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 sm:line-clamp-2">
                            {item.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default QuickQuery