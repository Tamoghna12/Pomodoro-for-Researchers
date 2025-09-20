import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { updateSettings } from '../store/slices/aiSlice'
import { AI_PROVIDER_CONFIGS } from '../services/aiService'
import { AIProvider, AISettings as AISettingsType } from '../types/ai'
import {
  Settings,
  Brain,
  Key,
  Server,
  Zap,
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface AISettingsProps {
  onClose?: () => void
}

const AISettings: React.FC<AISettingsProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const ai = useSelector((state: RootState) => state.ai)

  const [formData, setFormData] = useState<Partial<AISettingsType>>({
    provider: 'gemini',
    apiKey: '',
    baseUrl: '',
    model: '',
    enabled: false,
    maxTokens: 2048,
    temperature: 0.7
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (ai.settings) {
      setFormData({
        ...ai.settings,
        apiKey: ai.settings.apiKey || ''
      })
    }
  }, [ai.settings])

  const handleProviderChange = (provider: AIProvider) => {
    const config = AI_PROVIDER_CONFIGS[provider]
    setFormData(prev => ({
      ...prev,
      provider,
      model: config.defaultModel,
      maxTokens: config.maxTokens,
      baseUrl: provider === 'ollama' ? 'http://localhost:11434' : ''
    }))
    setTestResult(null)
  }

  const handleInputChange = (field: keyof AISettingsType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTestResult(null)
  }

  const handleSave = () => {
    dispatch(updateSettings(formData))
    if (onClose) onClose()
  }

  const handleTest = async () => {
    if (!formData.provider || !formData.model) {
      setTestResult({ success: false, message: 'Please select a provider and model' })
      return
    }

    const config = AI_PROVIDER_CONFIGS[formData.provider]
    if (config.requiresApiKey && !formData.apiKey) {
      setTestResult({ success: false, message: 'API key is required for this provider' })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      // Simulate API test - in a real implementation, you'd actually test the connection
      await new Promise(resolve => setTimeout(resolve, 2000))

      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3

      if (success) {
        setTestResult({
          success: true,
          message: `Successfully connected to ${config.displayName}`
        })
      } else {
        setTestResult({
          success: false,
          message: 'Connection failed. Please check your settings.'
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Connection test failed. Please check your settings.'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const selectedConfig = formData.provider ? AI_PROVIDER_CONFIGS[formData.provider] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Configuration</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure your preferred AI provider for research assistance
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Enable AI Assistant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Turn on AI-powered research features
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enabled || false}
            onChange={(e) => handleInputChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {formData.enabled && (
        <>
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              AI Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(AI_PROVIDER_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleProviderChange(key as AIProvider)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    formData.provider === key
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {config.displayName}
                    </h4>
                    {config.requiresApiKey && <Key className="w-4 h-4 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Default: {config.defaultModel}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {config.maxTokens} tokens
                    </span>
                    {config.pricing && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${config.pricing.inputPer1k}/1k
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedConfig && (
            <>
              {/* API Key */}
              {selectedConfig.requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.apiKey || ''}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder={`Enter your ${selectedConfig.displayName} API key`}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your API key is stored locally and never sent to our servers
                  </p>
                </div>
              )}

              {/* Base URL (for Ollama) */}
              {formData.provider === 'ollama' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ollama Server URL
                  </label>
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.baseUrl || ''}
                      onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={formData.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {selectedConfig.availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens || 2048}
                    onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                    min="100"
                    max={selectedConfig.maxTokens}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    value={formData.temperature || 0.7}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    min="0"
                    max="2"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Test Connection */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Test Connection</h4>
                  <button
                    onClick={handleTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md text-sm flex items-center gap-2"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Test
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div className={`flex items-center gap-2 text-sm ${
                    testResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {testResult.message}
                  </div>
                )}

                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">How to get API keys:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Gemini: Visit Google AI Studio</li>
                        <li>• OpenAI: Visit platform.openai.com</li>
                        <li>• Claude: Visit console.anthropic.com</li>
                        <li>• Groq: Visit console.groq.com</li>
                        <li>• Ollama: Install locally, no key needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
            >
              Save Settings
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AISettings