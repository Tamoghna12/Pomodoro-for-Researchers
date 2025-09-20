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
      await dispatch(sendQuickQuery(queryToSend) as any).unwrap()
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
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Quick Research Query</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get instant answers without interrupting your focus
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* AI Status */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
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
          <div className="p-4">
            {!ai.enabled ? (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Not Configured</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Configure your AI settings to use Quick Query
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={onToggleAssistant}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Open AI Settings
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
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
                    className="w-full p-4 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
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
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Lightbulb className="w-4 h-4" />
                    {showSuggestions ? 'Hide' : 'Show'} Suggestions
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!query.trim() || ai.isLoading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
                    >
                      Submit Query
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Suggested Research Queries
                    </h4>
                    <div className="grid gap-2">
                      {SUGGESTED_QUERIES.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSubmit(suggestion)}
                          disabled={ai.isLoading}
                          className="text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors disabled:opacity-50"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Queries */}
                {ai.recentQueries.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Recent Queries
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {ai.recentQueries.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {item.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
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