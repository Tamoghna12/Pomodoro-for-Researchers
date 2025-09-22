import { BaseAIProvider } from './base'
import { AIMessage, ResearchContext } from '../../types/ai'

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaRequest {
  model: string
  messages: OllamaMessage[]
  options?: {
    temperature?: number
    num_predict?: number
  }
}

interface OllamaResponse {
  message: {
    content: string
  }
}

export class OllamaProvider extends BaseAIProvider {
  private get baseUrl(): string {
    return this.settings.baseUrl || 'http://localhost:11434'
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: `You are an AI research assistant helping with academic research and productivity.
Provide helpful, accurate, and relevant responses to research-related questions.
Focus on practical advice and actionable insights.

${contextPrompt}`
      },
      {
        role: 'user',
        content: query
      }
    ]

    try {
      const response = await this.makeRequest(messages)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Quick query')
    }
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const ollamaMessages: OllamaMessage[] = [
      {
        role: 'system',
        content: `You are an AI research assistant. Help with research questions, productivity advice, and academic work.

${contextPrompt}`
      }
    ]

    // Convert chat messages to Ollama format
    messages.forEach(msg => {
      ollamaMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })
    })

    try {
      const response = await this.makeRequest(ollamaMessages)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Chat')
    }
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: `You are analyzing a research/productivity session.
Provide insights about focus patterns, productivity, and suggestions for improvement.
Keep the analysis concise but actionable.

${contextPrompt}`
      },
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
      const response = await this.makeRequest(messages)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Session analysis')
    }
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const contextPrompt = this.buildContextPrompt(context)

    const messages: OllamaMessage[] = [
      {
        role: 'system',
        content: `Generate 3-5 practical insights for improving research productivity.
Each insight should be actionable and specific. Format as a bulleted list.

${contextPrompt}`
      },
      {
        role: 'user',
        content: `Based on this data, generate insights:

${JSON.stringify(data, null, 2)}

Generate insights:`
      }
    ]

    try {
      const response = await this.makeRequest(messages)
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

  private async makeRequest(messages: OllamaMessage[]): Promise<OllamaResponse> {
    const url = `${this.baseUrl}/api/chat`

    const body: OllamaRequest = {
      model: this.settings.model,
      messages,
      options: {
        temperature: this.settings.temperature,
        num_predict: this.settings.maxTokens
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      if (response.status === 0 || !response.status) {
        throw new Error('Unable to connect to Ollama. Make sure Ollama is running on your local machine.')
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  private extractTextFromResponse(response: OllamaResponse): string {
    if (!response.message?.content) {
      throw new Error('Invalid response format from Ollama API')
    }
    return response.message.content
  }

  protected handleError(error: any, operation: string): never {
    console.error(`${operation} failed:`, error)
    if (error.message.includes('Unable to connect to Ollama')) {
      throw new Error('Cannot connect to Ollama. Please ensure Ollama is installed and running locally.')
    }
    if (error.message.includes('model')) {
      throw new Error('Model not found. Please ensure the specified model is available in Ollama.')
    }
    throw new Error(`${operation} failed: ${error.message || 'Unknown error'}`)
  }
}