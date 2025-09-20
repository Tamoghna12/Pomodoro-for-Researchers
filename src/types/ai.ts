export type AIProvider = 'gemini' | 'openai' | 'claude' | 'groq' | 'ollama'

export interface AISettings {
  provider: AIProvider
  apiKey: string
  baseUrl?: string // For Ollama or custom endpoints
  model: string
  enabled: boolean
  maxTokens: number
  temperature: number
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
}

export interface ChatSession {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
  pomodoroSession?: string // Link to pomodoro session
}

export interface ResearchQuery {
  id: string
  query: string
  response: string
  timestamp: Date
  source: 'quick-query' | 'chat' | 'session-summary'
  pomodoroSession?: string
}

export interface FocusInsight {
  id: string
  type: 'productivity-tip' | 'break-suggestion' | 'session-analysis' | 'research-pattern'
  title: string
  content: string
  timestamp: Date
  relevanceScore: number
}

export interface SessionSummary {
  sessionId: string
  totalTime: number
  completedPomodoros: number
  breaksTaken: number
  aiInsights: string[]
  researchTopics: string[]
  productivityScore: number
  suggestions: string[]
  timestamp: Date
}

export interface AIProviderConfig {
  name: string
  provider: AIProvider
  displayName: string
  defaultModel: string
  availableModels: string[]
  requiresApiKey: boolean
  supportsChat: boolean
  supportsQuickQuery: boolean
  maxTokens: number
  pricing?: {
    inputPer1k: number
    outputPer1k: number
  }
}

export interface ResearchContext {
  currentTopic?: string
  recentQueries: string[]
  sessionNotes: string[]
  focusAreas: string[]
  preferredSources?: string[]
}