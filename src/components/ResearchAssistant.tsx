import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import {
  initializeAI,
  createNewChat,
  // selectChat,
  sendChatMessage,
  sendQuickQuery,
  // updateResearchContext,
  clearError
} from '../store/slices/aiSlice'
import {
  MessageCircle,
  Send,
  Plus,
  Settings,
  Lightbulb,
  Search,
  X,
  Minimize2,
  // Maximize2,
  // BookOpen,
  Brain
} from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import AISettings from './AISettings'

interface ResearchAssistantProps {
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

const ResearchAssistant: React.FC<ResearchAssistantProps> = ({
  isMinimized = false,
  onToggleMinimize
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const ai = useSelector((state: RootState) => state.ai)
  // const timer = useSelector((state: RootState) => state.timer)

  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'settings'>('chat')
  const [showQuickQuery, setShowQuickQuery] = useState(false)
  const [quickQuery, setQuickQuery] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(initializeAI())
  }, [dispatch])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ai.currentChat?.messages])

  const handleSendMessage = async () => {
    if (!message.trim() || !ai.currentChat || ai.isLoading) return

    try {
      await dispatch(sendChatMessage({
        sessionId: ai.currentChat.id,
        message: message.trim()
      })).unwrap()
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleQuickQuery = async () => {
    if (!quickQuery.trim() || ai.isLoading) return

    try {
      await dispatch(sendQuickQuery(quickQuery.trim())).unwrap()
      setQuickQuery('')
      setShowQuickQuery(false)
    } catch (error) {
      console.error('Quick query failed:', error)
    }
  }

  const handleCreateNewChat = () => {
    const topic = ai.researchContext.currentTopic || 'General Research'
    dispatch(createNewChat({ title: `Research: ${topic}`, topic }))
    setActiveTab('chat')
  }

  const formatMessageContent = (content: string) => {
    const html = marked(content, {
      breaks: true,
      gfm: true
    })
    return DOMPurify.sanitize(html as string)
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={onToggleMinimize}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors mobile-tap-target"
        >
          <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:right-4 sm:left-auto w-full sm:w-96 h-[60vh] sm:h-[500px] bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:border sm:rounded-lg shadow-xl z-40 flex flex-col mobile-chat">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Research Assistant</h3>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToggleMinimize}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mobile-tap-target"
          >
            <Minimize2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setShowQuickQuery(!showQuickQuery)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mobile-tap-target"
            title="Quick Query"
          >
            <Search className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Quick Query Bar */}
      {showQuickQuery && (
        <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex gap-2">
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Quick research question..."
              className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickQuery()}
            />
            <button
              onClick={handleQuickQuery}
              disabled={ai.isLoading}
              className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm mobile-tap-target"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQuickQuery(false)}
              className="px-2 sm:px-3 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-md text-sm mobile-tap-target"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 p-2 sm:p-3 text-xs sm:text-sm font-medium border-b-2 transition-colors mobile-tap-target ${
            activeTab === 'chat'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Chat</span>
          <span className="sm:hidden">💬</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 p-2 sm:p-3 text-xs sm:text-sm font-medium border-b-2 transition-colors mobile-tap-target ${
            activeTab === 'insights'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Insights</span>
          <span className="sm:hidden">💡</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 p-2 sm:p-3 text-xs sm:text-sm font-medium border-b-2 transition-colors mobile-tap-target ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Settings</span>
          <span className="sm:hidden">⚙️</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {ai.currentChat ? ai.currentChat.title : 'No active chat'}
                </div>
                <button
                  onClick={handleCreateNewChat}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded mobile-tap-target"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2 sm:space-y-3">
              {!ai.enabled ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Configure AI settings to start chatting</p>
                </div>
              ) : !ai.currentChat ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Create a new chat to get started</p>
                  <button
                    onClick={handleCreateNewChat}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                  >
                    Start New Chat
                  </button>
                </div>
              ) : ai.currentChat.messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                  <p className="text-sm">Start a conversation with your research assistant</p>
                </div>
              ) : (
                ai.currentChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(msg.content)
                        }}
                        className="prose prose-sm max-w-none dark:prose-invert"
                      />
                    </div>
                  </div>
                ))
              )}
              {ai.isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {ai.enabled && ai.currentChat && (
              <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about your research..."
                    className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={ai.isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={ai.isLoading || !message.trim()}
                    className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md mobile-tap-target"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="h-full overflow-y-auto p-2 sm:p-3">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Recent Insights</h4>
              {ai.focusInsights.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <Lightbulb className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Complete some Pomodoro sessions to get AI-powered insights</p>
                </div>
              ) : (
                ai.focusInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  >
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                      {insight.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {insight.type.replace('-', ' ')} • {new Date(insight.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {insight.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-2 sm:p-3">
            <AISettings />
          </div>
        )}
      </div>

      {/* Error Display */}
      {ai.error && (
        <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-600 dark:text-red-400 flex-1">{ai.error}</p>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-2 mobile-tap-target"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResearchAssistant