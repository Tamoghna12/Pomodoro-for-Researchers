import { BaseAIProvider } from './base'
import { AIMessage, ResearchContext } from '../../types/ai'

interface GeminiMessage {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GeminiRequest {
  contents: GeminiMessage[]
  generationConfig?: {
    temperature?: number
    maxOutputTokens?: number
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
    }
  }>
}

export class GeminiProvider extends BaseAIProvider {
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)
    const researchPrompt = `You are an AI research assistant helping with academic research and productivity.
Provide helpful, accurate, and relevant responses to research-related questions.
Focus on practical advice and actionable insights.

${contextPrompt}

User query: ${query}`

    try {
      const response = await this.makeRequest([{
        role: 'user',
        parts: [{ text: researchPrompt }]
      }])

      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Quick query')
    }
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const geminiMessages: GeminiMessage[] = []

    // Add context as system message if available
    if (contextPrompt) {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: `Research context: ${contextPrompt}` }]
      })
      geminiMessages.push({
        role: 'model',
        parts: [{ text: 'I understand the research context. How can I help you?' }]
      })
    }

    // Convert chat messages to Gemini format
    messages.forEach(msg => {
      geminiMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })
    })

    try {
      const response = await this.makeRequest(geminiMessages)
      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Chat')
    }
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const contextPrompt = this.buildContextPrompt(context)

    const analysisPrompt = `You are analyzing a research/productivity session.
Provide insights about focus patterns, productivity, and suggestions for improvement.
Keep the analysis concise but actionable.

${contextPrompt}

Session data:
- Total time: ${sessionData.totalTime || 0} minutes
- Completed pomodoros: ${sessionData.completedPomodoros || 0}
- Breaks taken: ${sessionData.breaksTaken || 0}
- Session goal: ${sessionData.goal || 'Not specified'}
- Notes: ${sessionData.notes || 'None'}

Provide analysis and insights:`

    try {
      const response = await this.makeRequest([{
        role: 'user',
        parts: [{ text: analysisPrompt }]
      }])

      return this.extractTextFromResponse(response)
    } catch (error) {
      this.handleError(error, 'Session analysis')
    }
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const contextPrompt = this.buildContextPrompt(context)

    const insightsPrompt = `Generate 3-5 practical insights for improving research productivity based on the provided data.
Each insight should be actionable and specific. Format as a bulleted list.

${contextPrompt}

Data: ${JSON.stringify(data, null, 2)}

Generate insights:`

    try {
      const response = await this.makeRequest([{
        role: 'user',
        parts: [{ text: insightsPrompt }]
      }])

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

  private async makeRequest(messages: GeminiMessage[]): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${this.settings.model}:generateContent`

    const body: GeminiRequest = {
      contents: messages,
      generationConfig: {
        temperature: this.settings.temperature,
        maxOutputTokens: this.settings.maxTokens
      }
    }

    const response = await fetch(`${url}?key=${this.settings.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
    }

    return response.json()
  }

  private extractTextFromResponse(response: GeminiResponse): string {
    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API')
    }
    return response.candidates[0].content.parts[0].text
  }
}