import React, { useState, useRef, useEffect } from 'react'
import { aiService } from '../services/aiService'
import FollowUpQuestions from './FollowUpQuestions'
import {
  Send,
  User,
  Bot,
  Lightbulb,
  Copy,
  ThumbsUp,
  ThumbsDown,
  X,
  RefreshCw,
  Settings,
  Zap
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface AIChatProps {
  onClose: () => void
}

const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Load chat history
    const savedSessions = aiService.getChatSessions()
    if (savedSessions.length > 0) {
      const lastSession = savedSessions[0]
      setMessages(lastSession.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })))
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare chat history for AI
      const chatHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await aiService.chat(chatHistory.map(msg => ({
        id: msg.role === 'user' ? 'user' : 'assistant',
        role: msg.role,
        content: msg.content,
        timestamp: new Date()
      })))

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save chat session
      const chatSession = {
        id: Date.now().toString(),
        title: userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : ''),
        messages: [...messages, userMessage, assistantMessage].map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      aiService.saveChatSession(chatSession)

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please check your AI configuration and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFollowUpQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    })
  }

  const clearChat = () => {
    setMessages([])
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const lastUserMessage = messages.filter(m => m.role === 'user').pop()
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()

  return (
    <div className="glass-card h-full flex flex-col rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Research Assistant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {aiService.isEnabled() ? 'Ready to help with research' : 'AI not configured'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFollowUp(!showFollowUp)}
            className={`p-2 rounded-lg transition-colors ${
              showFollowUp ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Toggle Follow-up Questions"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">AI Settings</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {aiService.isEnabled() ? (
              <div className="space-y-2">
                <p>✅ AI service is active and ready</p>
                <p>Provider: {aiService.getSettings()?.provider || 'Not configured'}</p>
                <p>Model: {aiService.getSettings()?.model || 'Not configured'}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p>⚠️ AI service is not configured</p>
                <p>Please configure your AI provider in the settings to enable intelligent features.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              AI Research Assistant
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Ask questions about your research, get insights, or explore new topics.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Explain key concepts in my field',
                'Suggest research methodologies',
                'Help analyze my data',
                'Find related literature'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleFollowUpQuestion(suggestion)}
                  className="px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}

            <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 opacity-70">
                  <span className="text-xs">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Good response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Poor response"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message.role === 'user' && (
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Questions */}
      {showFollowUp && lastUserMessage && lastAssistantMessage && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <FollowUpQuestions
            lastQuery={lastUserMessage.content}
            lastResponse={lastAssistantMessage.content}
            onQuestionSelect={handleFollowUpQuestion}
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={aiService.isEnabled() ? "Ask anything about your research..." : "Please configure AI first"}
            disabled={!aiService.isEnabled() || isLoading}
            rows={1}
            className="flex-1 resize-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || !aiService.isEnabled() || isLoading}
            className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {aiService.isEnabled() && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>AI Ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIChat