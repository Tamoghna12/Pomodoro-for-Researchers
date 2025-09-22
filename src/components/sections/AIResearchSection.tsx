import React, { useState } from 'react'
import AIChat from '../AIChat'
import AISettings from '../AISettings'
import { aiService } from '../../services/aiService'
import {
  Bot,
  Settings,
  MessageSquare,
  Zap,
  Brain,
  ChevronRight
} from 'lucide-react'

const AIResearchSection: React.FC = () => {
  const [activeView, setActiveView] = useState<'chat' | 'settings'>('chat')
  const [showSettings, setShowSettings] = useState(false)

  const isAIConfigured = aiService.isEnabled()

  if (!isAIConfigured && activeView === 'chat') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            AI Research Assistant
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Configure your AI provider to start getting intelligent research assistance, automated insights, and enhanced productivity features.
          </p>
          <button
            onClick={() => setActiveView('settings')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Configure AI Provider
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Supported Providers</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div>🤖 Google Gemini</div>
              <div>🧠 OpenAI GPT</div>
              <div>🎭 Anthropic Claude</div>
              <div>⚡ Groq</div>
              <div>🦙 Ollama (Local)</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeView === 'settings' || showSettings) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => {
                setActiveView('chat')
                setShowSettings(false)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Configuration
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure your AI providers and research tools
              </p>
            </div>
          </div>
          <AISettings onClose={() => {
            setActiveView('chat')
            setShowSettings(false)
          }} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Research Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent research companion powered by advanced AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
            <Zap className="w-4 h-4" />
            <span>AI Ready</span>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="AI Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 p-6">
        <AIChat onClose={() => {}} />
      </div>
    </div>
  )
}

export default AIResearchSection