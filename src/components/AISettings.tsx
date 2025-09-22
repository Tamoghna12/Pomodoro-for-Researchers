import React, { useState, useEffect } from 'react'
import { aiService, AI_PROVIDER_CONFIGS } from '../services/aiService'
import { AISettings as AISettingsType, AIProvider } from '../types/ai'
import {
  Settings,
  Key,
  Brain,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Globe,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface AISettingsProps {
  onClose?: () => void
}

const AISettings: React.FC<AISettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<Partial<AISettingsType>>(
    aiService.getSettings() || {
      provider: 'gemini',
      apiKey: '',
      model: 'gemini-1.5-flash',
      enabled: false,
      maxTokens: 4096,
      temperature: 0.7
    }
  )
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [braveApiKey, setBraveApiKey] = useState('')

  useEffect(() => {
    // Load Brave API key from localStorage
    const savedBraveKey = localStorage.getItem('brave-search-api-key')
    if (savedBraveKey) {
      setBraveApiKey(savedBraveKey)
    }
  }, [])

  const handleProviderChange = (provider: AIProvider) => {
    const providerConfig = AI_PROVIDER_CONFIGS[provider]
    setSettings(prev => ({
      ...prev,
      provider,
      model: providerConfig.defaultModel,
      maxTokens: providerConfig.maxTokens,
      apiKey: prev.provider === provider ? prev.apiKey : ''
    }))
    setConnectionStatus('idle')
  }

  const handleSaveSettings = () => {
    if (!settings.apiKey && settings.provider !== 'ollama') {
      setErrorMessage('API key is required for this provider')
      return
    }

    try {
      aiService.updateSettings(settings as AISettingsType)

      // Save Brave Search API key
      if (braveApiKey) {
        localStorage.setItem('brave-search-api-key', braveApiKey)
      }

      setConnectionStatus('success')
      setErrorMessage('')

      // Auto close after successful save
      setTimeout(() => {
        onClose?.()
      }, 1500)
    } catch {
      setConnectionStatus('error')
      setErrorMessage('Failed to save settings')
    }
  }

  const handleTestConnection = async () => {
    if (!settings.apiKey && settings.provider !== 'ollama') {
      setErrorMessage('Please enter an API key first')
      return
    }

    setTestingConnection(true)
    setErrorMessage('')

    try {
      // Temporarily apply settings for testing
      const testSettings = { ...settings, enabled: true } as AISettingsType
      aiService.updateSettings(testSettings)

      // Test with a simple query
      await aiService.quickQuery('Hello, this is a connection test.')

      setConnectionStatus('success')
      setSettings(prev => ({ ...prev, enabled: true }))
    } catch (error: unknown) {
      setConnectionStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini': return '🤖'
      case 'openai': return '🧠'
      case 'claude': return '🎭'
      case 'groq': return '⚡'
      case 'ollama': return '🦙'
      default: return '🤖'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400'
      case 'error': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const currentProvider = AI_PROVIDER_CONFIGS[settings.provider as AIProvider]

  return (
    <div className="glass-card p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Configuration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure AI providers and search integration
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          AI Provider
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(AI_PROVIDER_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleProviderChange(key as AIProvider)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                settings.provider === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getProviderIcon(key as AIProvider)}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {config.displayName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {config.defaultModel} • {config.requiresApiKey ? 'API Key Required' : 'Local'}
                    </div>
                  </div>
                </div>
                {config.pricing && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${config.pricing.inputPer1k}/1K tokens
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Configuration */}
      {currentProvider?.requiresApiKey && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Key className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Your API key is stored locally and never sent to our servers
          </p>
        </div>
      )}

      {/* Brave Search API Key */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Brave Search API Key (Optional)
          </div>
        </label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={braveApiKey}
            onChange={(e) => setBraveApiKey(e.target.value)}
            placeholder="Enter Brave Search API key for enhanced research"
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Enables web search integration for research queries
          </p>
          <a
            href="https://brave.com/search/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Get API Key <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Model
        </label>
        <select
          value={settings.model || currentProvider?.defaultModel}
          onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currentProvider?.availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Tokens: {settings.maxTokens}
              </label>
              <input
                type="range"
                min="512"
                max={currentProvider?.maxTokens || 8192}
                value={settings.maxTokens || 4096}
                onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Temperature: {settings.temperature?.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature || 0.7}
                onChange={(e) => setSettings(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="text-sm text-red-700 dark:text-red-300">{errorMessage}</span>
        </div>
      )}

      {/* Connection Status */}
      {connectionStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          connectionStatus === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          {connectionStatus === 'success' ? (
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm ${getStatusColor(connectionStatus)}`}>
            {connectionStatus === 'success'
              ? 'AI connection successful! Settings saved.'
              : 'Connection failed. Please check your settings.'
            }
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleTestConnection}
          disabled={testingConnection || (!settings.apiKey && currentProvider?.requiresApiKey)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
        >
          {testingConnection ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Test Connection
            </>
          )}
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={!settings.apiKey && currentProvider?.requiresApiKey}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
        >
          <Settings className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      {/* Current Status */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current Status:</span>
          <span className={`font-medium ${
            aiService.isEnabled() ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {aiService.isEnabled() ? '✅ AI Enabled' : '⚠️ AI Disabled'}
          </span>
        </div>
        {aiService.isEnabled() && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Using {currentProvider?.displayName} with {settings.model}
          </div>
        )}
      </div>
    </div>
  )
}

export default AISettings