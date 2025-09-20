import {
  AIProvider,
  AISettings,
  AIMessage,
  ChatSession,
  ResearchQuery,
  FocusInsight,
  SessionSummary,
  AIProviderConfig,
  ResearchContext
} from '../types/ai'
import {
  GeminiProvider,
  OpenAIProvider,
  ClaudeProvider,
  GroqProvider,
  OllamaProvider,
  AIProviderInterface
} from './aiProviders'

export const AI_PROVIDER_CONFIGS: Record<AIProvider, AIProviderConfig> = {
  gemini: {
    name: 'gemini',
    provider: 'gemini',
    displayName: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    availableModels: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    requiresApiKey: true,
    supportsChat: true,
    supportsQuickQuery: true,
    maxTokens: 8192,
    pricing: { inputPer1k: 0.075, outputPer1k: 0.3 }
  },
  openai: {
    name: 'openai',
    provider: 'openai',
    displayName: 'OpenAI GPT',
    defaultModel: 'gpt-4o-mini',
    availableModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    supportsChat: true,
    supportsQuickQuery: true,
    maxTokens: 4096,
    pricing: { inputPer1k: 0.15, outputPer1k: 0.6 }
  },
  claude: {
    name: 'claude',
    provider: 'claude',
    displayName: 'Anthropic Claude',
    defaultModel: 'claude-3-haiku-20240307',
    availableModels: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    requiresApiKey: true,
    supportsChat: true,
    supportsQuickQuery: true,
    maxTokens: 4096,
    pricing: { inputPer1k: 0.25, outputPer1k: 1.25 }
  },
  groq: {
    name: 'groq',
    provider: 'groq',
    displayName: 'Groq',
    defaultModel: 'llama3-8b-8192',
    availableModels: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'],
    requiresApiKey: true,
    supportsChat: true,
    supportsQuickQuery: true,
    maxTokens: 8192,
    pricing: { inputPer1k: 0.05, outputPer1k: 0.08 }
  },
  ollama: {
    name: 'ollama',
    provider: 'ollama',
    displayName: 'Ollama (Local)',
    defaultModel: 'llama3.2',
    availableModels: ['llama3.2', 'mistral', 'codellama', 'phi3'],
    requiresApiKey: false,
    supportsChat: true,
    supportsQuickQuery: true,
    maxTokens: 4096
  }
}

export class AIService {
  private provider: AIProviderInterface | null = null
  private settings: AISettings | null = null
  private context: ResearchContext = {
    recentQueries: [],
    sessionNotes: [],
    focusAreas: []
  }

  constructor() {
    this.loadSettings()
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('ai-settings')
      if (saved) {
        this.settings = JSON.parse(saved)
        this.initializeProvider()
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error)
    }
  }

  private saveSettings(): void {
    if (this.settings) {
      try {
        localStorage.setItem('ai-settings', JSON.stringify(this.settings))
      } catch (error) {
        console.error('Failed to save AI settings:', error)
      }
    }
  }

  private initializeProvider(): void {
    if (!this.settings || !this.settings.enabled) {
      this.provider = null
      return
    }

    try {
      switch (this.settings.provider) {
        case 'gemini':
          this.provider = new GeminiProvider(this.settings)
          break
        case 'openai':
          this.provider = new OpenAIProvider(this.settings)
          break
        case 'claude':
          this.provider = new ClaudeProvider(this.settings)
          break
        case 'groq':
          this.provider = new GroqProvider(this.settings)
          break
        case 'ollama':
          this.provider = new OllamaProvider(this.settings)
          break
        default:
          throw new Error(`Unsupported provider: ${this.settings.provider}`)
      }
    } catch (error) {
      console.error('Failed to initialize AI provider:', error)
      this.provider = null
    }
  }

  public updateSettings(newSettings: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...newSettings } as AISettings
    this.saveSettings()
    this.initializeProvider()
  }

  public getSettings(): AISettings | null {
    return this.settings
  }

  public isEnabled(): boolean {
    return this.settings?.enabled === true && this.provider !== null
  }

  public getProviderConfigs(): Record<AIProvider, AIProviderConfig> {
    return AI_PROVIDER_CONFIGS
  }

  public updateResearchContext(updates: Partial<ResearchContext>): void {
    this.context = { ...this.context, ...updates }
  }

  public async quickQuery(query: string): Promise<ResearchQuery> {
    if (!this.provider) {
      throw new Error('AI provider not configured')
    }

    try {
      const response = await this.provider.quickQuery(query, this.context)

      // Update context with recent query
      this.context.recentQueries = [query, ...this.context.recentQueries.slice(0, 4)]

      const result: ResearchQuery = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
        source: 'quick-query'
      }

      this.saveQuery(result)
      return result
    } catch (error) {
      console.error('Quick query failed:', error)
      throw new Error('Failed to process quick query')
    }
  }

  public async chat(messages: AIMessage[]): Promise<string> {
    if (!this.provider) {
      throw new Error('AI provider not configured')
    }

    try {
      return await this.provider.chat(messages, this.context)
    } catch (error) {
      console.error('Chat failed:', error)
      throw new Error('Failed to process chat message')
    }
  }

  public async analyzeSession(sessionData: any): Promise<SessionSummary> {
    if (!this.provider) {
      throw new Error('AI provider not configured')
    }

    try {
      const analysis = await this.provider.analyzeSession(sessionData, this.context)
      const insights = await this.provider.generateInsights(sessionData, this.context)

      const summary: SessionSummary = {
        sessionId: sessionData.id || Date.now().toString(),
        totalTime: sessionData.totalTime || 0,
        completedPomodoros: sessionData.completedPomodoros || 0,
        breaksTaken: sessionData.breaksTaken || 0,
        aiInsights: [analysis],
        researchTopics: this.extractTopics(analysis),
        productivityScore: this.calculateProductivityScore(sessionData),
        suggestions: insights,
        timestamp: new Date()
      }

      this.saveSessionSummary(summary)
      return summary
    } catch (error) {
      console.error('Session analysis failed:', error)
      throw new Error('Failed to analyze session')
    }
  }

  public async generateFocusInsights(data: any): Promise<FocusInsight[]> {
    if (!this.provider) {
      return []
    }

    try {
      const insights = await this.provider.generateInsights(data, this.context)

      return insights.map((insight, index) => ({
        id: `${Date.now()}-${index}`,
        type: this.classifyInsightType(insight),
        title: this.extractInsightTitle(insight),
        content: insight,
        timestamp: new Date(),
        relevanceScore: Math.random() * 0.3 + 0.7 // Simple scoring for now
      }))
    } catch (error) {
      console.error('Failed to generate insights:', error)
      return []
    }
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - could be enhanced with NLP
    const topics = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
    return [...new Set(topics)].slice(0, 5)
  }

  private calculateProductivityScore(sessionData: any): number {
    // Simple productivity calculation
    const completionRate = sessionData.completedPomodoros / (sessionData.plannedPomodoros || 1)
    const timeEfficiency = sessionData.focusTime / sessionData.totalTime
    return Math.min(100, Math.round((completionRate * 0.6 + timeEfficiency * 0.4) * 100))
  }

  private classifyInsightType(insight: string): FocusInsight['type'] {
    if (insight.toLowerCase().includes('break') || insight.toLowerCase().includes('rest')) {
      return 'break-suggestion'
    }
    if (insight.toLowerCase().includes('productivity') || insight.toLowerCase().includes('efficient')) {
      return 'productivity-tip'
    }
    if (insight.toLowerCase().includes('pattern') || insight.toLowerCase().includes('trend')) {
      return 'research-pattern'
    }
    return 'session-analysis'
  }

  private extractInsightTitle(insight: string): string {
    // Extract first sentence or first 50 characters as title
    const firstSentence = insight.split('.')[0]
    return firstSentence.length > 50 ? firstSentence.substring(0, 47) + '...' : firstSentence
  }

  private saveQuery(query: ResearchQuery): void {
    try {
      const queries = this.getStoredQueries()
      queries.unshift(query)
      localStorage.setItem('research-queries', JSON.stringify(queries.slice(0, 50)))
    } catch (error) {
      console.error('Failed to save query:', error)
    }
  }

  private saveSessionSummary(summary: SessionSummary): void {
    try {
      const summaries = this.getStoredSummaries()
      summaries.unshift(summary)
      localStorage.setItem('session-summaries', JSON.stringify(summaries.slice(0, 20)))
    } catch (error) {
      console.error('Failed to save session summary:', error)
    }
  }

  public getStoredQueries(): ResearchQuery[] {
    try {
      const stored = localStorage.getItem('research-queries')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load queries:', error)
      return []
    }
  }

  public getStoredSummaries(): SessionSummary[] {
    try {
      const stored = localStorage.getItem('session-summaries')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load summaries:', error)
      return []
    }
  }

  public getChatSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem('chat-sessions')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
      return []
    }
  }

  public saveChatSession(session: ChatSession): void {
    try {
      const sessions = this.getChatSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)

      if (existingIndex >= 0) {
        sessions[existingIndex] = session
      } else {
        sessions.unshift(session)
      }

      localStorage.setItem('chat-sessions', JSON.stringify(sessions.slice(0, 10)))
    } catch (error) {
      console.error('Failed to save chat session:', error)
    }
  }
}

export const aiService = new AIService()