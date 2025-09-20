import React, { useState } from 'react'
import {
  ExternalLink,
  Key,
  Copy,
  CheckCircle,
  ArrowRight,
  Info,
  Zap,
  DollarSign,
  Shield
} from 'lucide-react'
import { AIProvider } from '../types/ai'

interface APIKeySetupProps {
  provider: AIProvider
  onComplete: (apiKey: string) => void
  onBack: () => void
}

const API_SETUP_GUIDES = {
  gemini: {
    name: 'Google Gemini',
    url: 'https://makersuite.google.com/app/apikey',
    steps: [
      'Visit Google AI Studio',
      'Sign in with your Google account',
      'Click "Create API Key"',
      'Select a project or create new one',
      'Copy the generated API key',
      'Paste it below'
    ],
    pricing: 'Free tier: 15 requests/minute, then $0.075/1k tokens',
    features: ['Fast responses', 'Good for quick queries', 'Excellent for research summaries'],
    tips: 'Perfect for researchers who want fast, cost-effective AI assistance'
  },
  openai: {
    name: 'OpenAI GPT',
    url: 'https://platform.openai.com/api-keys',
    steps: [
      'Go to OpenAI Platform',
      'Sign up or log in to your account',
      'Navigate to API Keys section',
      'Click "Create new secret key"',
      'Name your key (e.g., "Pomodoro Research")',
      'Copy the key immediately (you won\'t see it again!)',
      'Paste it below'
    ],
    pricing: 'Pay-per-use: $0.15/1k input tokens, $0.60/1k output',
    features: ['Most reliable', 'Excellent reasoning', 'Great for complex research questions'],
    tips: 'Industry standard - most tested and reliable for academic work'
  },
  claude: {
    name: 'Anthropic Claude',
    url: 'https://console.anthropic.com/account/keys',
    steps: [
      'Visit Anthropic Console',
      'Create account or sign in',
      'Go to API Keys section',
      'Click "Create Key"',
      'Name your key descriptively',
      'Copy the generated key',
      'Paste it below'
    ],
    pricing: 'Pay-per-use: $0.25/1k input tokens, $1.25/1k output',
    features: ['Best reasoning', 'Excellent for methodology', 'Great safety features'],
    tips: 'Best for complex research design and methodology questions'
  },
  groq: {
    name: 'Groq',
    url: 'https://console.groq.com/keys',
    steps: [
      'Go to Groq Console',
      'Sign up with email or GitHub',
      'Navigate to API Keys',
      'Click "Create API Key"',
      'Give it a descriptive name',
      'Copy the key',
      'Paste it below'
    ],
    pricing: 'Free tier generous, then $0.05/1k tokens',
    features: ['Ultra-fast responses', 'Great for quick queries', 'Excellent price/performance'],
    tips: 'Fastest AI responses - perfect for real-time research assistance'
  },
  ollama: {
    name: 'Ollama (Local)',
    url: 'https://ollama.ai/download',
    steps: [
      'Download Ollama for your OS',
      'Install and start Ollama',
      'Open terminal/command prompt',
      'Run: ollama pull llama3.2',
      'Wait for model download',
      'Ollama will run on localhost:11434',
      'No API key needed!'
    ],
    pricing: 'Completely free - runs on your computer',
    features: ['Complete privacy', 'No internet needed', 'No usage limits'],
    tips: 'Perfect for sensitive research data - everything stays on your computer'
  }
}

const APIKeySetup: React.FC<APIKeySetupProps> = ({ provider, onComplete, onBack }) => {
  const [apiKey, setApiKey] = useState('')
  const [step, setStep] = useState<'guide' | 'input'>('guide')
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const guide = API_SETUP_GUIDES[provider]

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepIndex)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const handleComplete = () => {
    if (apiKey.trim() || provider === 'ollama') {
      onComplete(apiKey.trim())
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Set up {guide.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get your API key to unlock AI-powered research assistance
            </p>
          </div>
        </div>
      </div>

      {step === 'guide' && (
        <>
          {/* Provider Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-200">Pricing</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">{guide.pricing}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-800 dark:text-blue-200">Speed</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {provider === 'groq' ? 'Ultra Fast' : provider === 'ollama' ? 'Local' : 'Fast'}
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-800 dark:text-purple-200">Privacy</span>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                {provider === 'ollama' ? 'Complete' : 'API Keys Local'}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Perfect for:</h3>
            <div className="flex flex-wrap gap-2">
              {guide.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{guide.tips}</p>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">Setup Steps:</h3>

            {/* Open Link Button */}
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Open {guide.name} {provider === 'ollama' ? 'Download Page' : 'Console'}
            </a>

            {/* Steps */}
            <div className="space-y-3">
              {guide.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                  {step.includes('ollama pull') && (
                    <button
                      onClick={() => copyToClipboard('ollama pull llama3.2', index)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                    >
                      {copiedStep === index ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
            >
              Back to Providers
            </button>
            <button
              onClick={() => setStep('input')}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {provider === 'ollama' ? 'Continue Setup' : 'I have my API key'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {step === 'input' && (
        <>
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {provider === 'ollama' ? 'Confirm Ollama Setup' : 'Enter Your API Key'}
            </h3>

            {provider !== 'ollama' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {guide.name} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium mb-1">Your API key is secure:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Stored only in your browser's local storage</li>
                        <li>• Never sent to our servers</li>
                        <li>• Only used to communicate with {guide.name}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">Ollama Setup</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Once you've installed Ollama and downloaded a model, your AI assistant will run completely offline on your computer.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Default URL:</strong> http://localhost:11434<br/>
                    You can change this in the AI settings if needed.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('guide')}
              className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
            >
              Back to Guide
            </button>
            <button
              onClick={handleComplete}
              disabled={!apiKey.trim() && provider !== 'ollama'}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Setup
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default APIKeySetup