import { AISettings, AIMessage, ResearchContext } from '../../types/ai'

export interface AIProviderInterface {
  quickQuery(query: string, context?: ResearchContext): Promise<string>
  chat(messages: AIMessage[], context?: ResearchContext): Promise<string>
  analyzeSession(sessionData: any, context?: ResearchContext): Promise<string>
  generateInsights(data: any, context?: ResearchContext): Promise<string[]>
}

export abstract class BaseAIProvider implements AIProviderInterface {
  protected settings: AISettings

  constructor(settings: AISettings) {
    this.settings = settings
  }

  abstract quickQuery(query: string, context?: ResearchContext): Promise<string>
  abstract chat(messages: AIMessage[], context?: ResearchContext): Promise<string>
  abstract analyzeSession(sessionData: any, context?: ResearchContext): Promise<string>
  abstract generateInsights(data: any, context?: ResearchContext): Promise<string[]>

  protected buildContextPrompt(context?: ResearchContext): string {
    if (!context) return ''

    let prompt = ''
    if (context.currentTopic) {
      prompt += `Current research topic: ${context.currentTopic}\n`
    }
    if (context.focusAreas?.length) {
      prompt += `Focus areas: ${context.focusAreas.join(', ')}\n`
    }
    if (context.recentQueries?.length) {
      prompt += `Recent queries: ${context.recentQueries.slice(0, 3).join('; ')}\n`
    }
    return prompt ? `\nContext:\n${prompt}\n` : ''
  }

  protected handleError(error: any, operation: string): never {
    console.error(`${operation} failed:`, error)
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your configuration.')
    }
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    if (error.response?.status === 402) {
      throw new Error('Insufficient credits. Please check your account.')
    }
    throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`)
  }
}