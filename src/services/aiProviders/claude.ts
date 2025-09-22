import { BaseAIProvider } from './base'
import { AIMessage, ResearchContext } from '../../types/ai'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeRequest {
  model: string
  messages: ClaudeMessage[]
  system?: string
  temperature?: number
  max_tokens?: number
}

interface ClaudeResponse {
  content: Array<{
    text: string
  }>
}

export class ClaudeProvider extends BaseAIProvider {
  private readonly baseUrl = 'https://api.anthropic.com/v1'

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const systemPrompt = `You are an AI research assistant helping with academic research and productivity.
Provide helpful, accurate, and relevant responses to research-related questions.
Focus on practical advice and actionable insights.

${contextPrompt}`

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: query
      }
    ]

    try {
      const response = await this.makeRequest(messages, systemPrompt)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Quick query')
    }
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const systemPrompt = `You are an AI research assistant. Help with research questions, productivity advice, and academic work.

${contextPrompt}`

    // Convert chat messages to Claude format
    const claudeMessages: ClaudeMessage[] = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))

    try {
      const response = await this.makeRequest(claudeMessages, systemPrompt)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Chat')
    }
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const systemPrompt = `You are analyzing a research/productivity session.
Provide insights about focus patterns, productivity, and suggestions for improvement.
Keep the analysis concise but actionable.

${contextPrompt}`

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Analyze this research session:

Session data:
- Total time: ${sessionData.totalTime || 0} minutes
- Completed pomodoros: ${sessionData.completedPomodoros || 0}
- Breaks taken: ${sessionData.breaksTaken || 0}
- Session goal: ${sessionData.goal || 'Not specified'}
- Notes: ${sessionData.notes || 'None'}

Provide analysis and insights:`
      }
    ]

    try {
      const response = await this.makeRequest(messages, systemPrompt)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Session analysis')
    }
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const contextPrompt = this.buildContextPrompt(context)

    const systemPrompt = `Generate 3-5 practical insights for improving research productivity.
Each insight should be actionable and specific. Format as a bulleted list.

${contextPrompt}`

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `Based on this data, generate insights:

${JSON.stringify(data, null, 2)}

Generate insights:`
      }
    ]

    try {
      const response = await this.makeRequest(messages, systemPrompt)
      const text = this.extractTextFromResponse(response)

      // Parse insights from response
      return text.split('\n')
        .filter(line => line.trim())
        .filter(line => line.includes('•') || line.includes('-') || line.includes('*'))
        .map(line => line.replace(/^[•\-*]\s*/, '').trim())
        .filter(line => line.length > 10)
        .slice(0, 5)
    } catch (error) {
      this.handleError(error, 'Insights generation')
    }
  }

  private async makeRequest(messages: ClaudeMessage[], system?: string): Promise<ClaudeResponse> {
    const url = `${this.baseUrl}/messages`

    const body: ClaudeRequest = {
      model: this.settings.model,
      messages,
      temperature: this.settings.temperature,
      max_tokens: this.settings.maxTokens
    }

    if (system) {
      body.system = system
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.settings.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    return response.json()
  }

  private extractTextFromResponse(response: ClaudeResponse): string {
    if (!response.content?.[0]?.text) {
      throw new Error('Invalid response format from Claude API')
    }
    return response.content[0].text
  }
}