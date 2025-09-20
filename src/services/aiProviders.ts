import axios, { AxiosInstance } from 'axios'
import { AIProvider, AISettings, AIMessage, ResearchContext } from '../types/ai'

export interface AIProviderInterface {
  chat(messages: AIMessage[], context?: ResearchContext): Promise<string>
  quickQuery(query: string, context?: ResearchContext): Promise<string>
  analyzeSession(sessionData: any, context?: ResearchContext): Promise<string>
  generateInsights(data: any, context?: ResearchContext): Promise<string[]>
}

abstract class BaseAIProvider implements AIProviderInterface {
  protected client: AxiosInstance
  protected settings: AISettings

  constructor(settings: AISettings) {
    this.settings = settings
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  abstract chat(messages: AIMessage[], context?: ResearchContext): Promise<string>
  abstract quickQuery(query: string, context?: ResearchContext): Promise<string>
  abstract analyzeSession(sessionData: any, context?: ResearchContext): Promise<string>
  abstract generateInsights(data: any, context?: ResearchContext): Promise<string[]>

  protected buildResearchPrompt(basePrompt: string, context?: ResearchContext): string {
    if (!context) return basePrompt

    let contextPrompt = basePrompt + '\n\nContext:\n'

    if (context.currentTopic) {
      contextPrompt += `Current research topic: ${context.currentTopic}\n`
    }

    if (context.focusAreas?.length) {
      contextPrompt += `Focus areas: ${context.focusAreas.join(', ')}\n`
    }

    if (context.recentQueries?.length) {
      contextPrompt += `Recent queries: ${context.recentQueries.slice(-3).join(', ')}\n`
    }

    return contextPrompt
  }
}

export class GeminiProvider extends BaseAIProvider {
  constructor(settings: AISettings) {
    super(settings)
    this.client.defaults.baseURL = 'https://generativelanguage.googleapis.com/v1beta'
    this.client.defaults.headers['Authorization'] = `Bearer ${settings.apiKey}`
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      'You are a research assistant helping with academic work during a Pomodoro session. Provide helpful, accurate, and concise responses.',
      context
    )

    const response = await this.client.post(`/models/${this.settings.model}:generateContent`, {
      contents: [
        { parts: [{ text: prompt }] },
        ...messages.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'user' ? 'user' : 'model'
        }))
      ],
      generationConfig: {
        temperature: this.settings.temperature,
        maxOutputTokens: this.settings.maxTokens,
      }
    })

    return response.data.candidates[0].content.parts[0].text
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Answer this research question concisely and accurately: ${query}`,
      context
    )

    const response = await this.client.post(`/models/${this.settings.model}:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 500,
      }
    })

    return response.data.candidates[0].content.parts[0].text
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Analyze this Pomodoro session and provide insights: ${JSON.stringify(sessionData)}`,
      context
    )

    const response = await this.client.post(`/models/${this.settings.model}:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800,
      }
    })

    return response.data.candidates[0].content.parts[0].text
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const prompt = this.buildResearchPrompt(
      `Based on this data, provide 3-5 productivity insights for a researcher: ${JSON.stringify(data)}`,
      context
    )

    const response = await this.client.post(`/models/${this.settings.model}:generateContent`, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 600,
      }
    })

    const text = response.data.candidates[0].content.parts[0].text
    return text.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.trim())
  }
}

export class OpenAIProvider extends BaseAIProvider {
  constructor(settings: AISettings) {
    super(settings)
    this.client.defaults.baseURL = 'https://api.openai.com/v1'
    this.client.defaults.headers['Authorization'] = `Bearer ${settings.apiKey}`
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const systemPrompt = this.buildResearchPrompt(
      'You are a research assistant helping with academic work during a Pomodoro session. Provide helpful, accurate, and concise responses.',
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: this.settings.temperature,
      max_tokens: this.settings.maxTokens,
    })

    return response.data.choices[0].message.content
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Answer this research question concisely and accurately: ${query}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    return response.data.choices[0].message.content
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Analyze this Pomodoro session and provide insights: ${JSON.stringify(sessionData)}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    })

    return response.data.choices[0].message.content
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const prompt = this.buildResearchPrompt(
      `Based on this data, provide 3-5 productivity insights for a researcher: ${JSON.stringify(data)}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    })

    const text = response.data.choices[0].message.content
    return text.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.trim())
  }
}

export class ClaudeProvider extends BaseAIProvider {
  constructor(settings: AISettings) {
    super(settings)
    this.client.defaults.baseURL = 'https://api.anthropic.com/v1'
    this.client.defaults.headers['x-api-key'] = settings.apiKey
    this.client.defaults.headers['anthropic-version'] = '2023-06-01'
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const systemPrompt = this.buildResearchPrompt(
      'You are a research assistant helping with academic work during a Pomodoro session. Provide helpful, accurate, and concise responses.',
      context
    )

    const response = await this.client.post('/messages', {
      model: this.settings.model,
      system: systemPrompt,
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      temperature: this.settings.temperature,
      max_tokens: this.settings.maxTokens,
    })

    return response.data.content[0].text
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Answer this research question concisely and accurately: ${query}`,
      context
    )

    const response = await this.client.post('/messages', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    return response.data.content[0].text
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Analyze this Pomodoro session and provide insights: ${JSON.stringify(sessionData)}`,
      context
    )

    const response = await this.client.post('/messages', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    })

    return response.data.content[0].text
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const prompt = this.buildResearchPrompt(
      `Based on this data, provide 3-5 productivity insights for a researcher: ${JSON.stringify(data)}`,
      context
    )

    const response = await this.client.post('/messages', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    })

    const text = response.data.content[0].text
    return text.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.trim())
  }
}

export class GroqProvider extends BaseAIProvider {
  constructor(settings: AISettings) {
    super(settings)
    this.client.defaults.baseURL = 'https://api.groq.com/openai/v1'
    this.client.defaults.headers['Authorization'] = `Bearer ${settings.apiKey}`
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const systemPrompt = this.buildResearchPrompt(
      'You are a research assistant helping with academic work during a Pomodoro session. Provide helpful, accurate, and concise responses.',
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ role: msg.role, content: msg.content }))
      ],
      temperature: this.settings.temperature,
      max_tokens: this.settings.maxTokens,
    })

    return response.data.choices[0].message.content
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Answer this research question concisely and accurately: ${query}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    return response.data.choices[0].message.content
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Analyze this Pomodoro session and provide insights: ${JSON.stringify(sessionData)}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    })

    return response.data.choices[0].message.content
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const prompt = this.buildResearchPrompt(
      `Based on this data, provide 3-5 productivity insights for a researcher: ${JSON.stringify(data)}`,
      context
    )

    const response = await this.client.post('/chat/completions', {
      model: this.settings.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 600,
    })

    const text = response.data.choices[0].message.content
    return text.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.trim())
  }
}

export class OllamaProvider extends BaseAIProvider {
  constructor(settings: AISettings) {
    super(settings)
    this.client.defaults.baseURL = settings.baseUrl || 'http://localhost:11434/api'
  }

  async chat(messages: AIMessage[], context?: ResearchContext): Promise<string> {
    const systemPrompt = this.buildResearchPrompt(
      'You are a research assistant helping with academic work during a Pomodoro session. Provide helpful, accurate, and concise responses.',
      context
    )

    const prompt = systemPrompt + '\n\n' + messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')

    const response = await this.client.post('/generate', {
      model: this.settings.model,
      prompt,
      stream: false,
      options: {
        temperature: this.settings.temperature,
        num_predict: this.settings.maxTokens,
      }
    })

    return response.data.response
  }

  async quickQuery(query: string, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Answer this research question concisely and accurately: ${query}`,
      context
    )

    const response = await this.client.post('/generate', {
      model: this.settings.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 500,
      }
    })

    return response.data.response
  }

  async analyzeSession(sessionData: any, context?: ResearchContext): Promise<string> {
    const prompt = this.buildResearchPrompt(
      `Analyze this Pomodoro session and provide insights: ${JSON.stringify(sessionData)}`,
      context
    )

    const response = await this.client.post('/generate', {
      model: this.settings.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 800,
      }
    })

    return response.data.response
  }

  async generateInsights(data: any, context?: ResearchContext): Promise<string[]> {
    const prompt = this.buildResearchPrompt(
      `Based on this data, provide 3-5 productivity insights for a researcher: ${JSON.stringify(data)}`,
      context
    )

    const response = await this.client.post('/generate', {
      model: this.settings.model,
      prompt,
      stream: false,
      options: {
        temperature: 0.5,
        num_predict: 600,
      }
    })

    const text = response.data.response
    return text.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.trim())
  }
}