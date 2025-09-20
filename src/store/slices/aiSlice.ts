import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import {
  AISettings,
  AIProvider,
  ChatSession,
  AIMessage,
  ResearchQuery,
  FocusInsight,
  SessionSummary,
  ResearchContext
} from '../../types/ai'
import { aiService } from '../../services/aiService'

interface AIState {
  settings: AISettings | null
  enabled: boolean
  currentChat: ChatSession | null
  chatSessions: ChatSession[]
  recentQueries: ResearchQuery[]
  focusInsights: FocusInsight[]
  sessionSummaries: SessionSummary[]
  researchContext: ResearchContext
  isLoading: boolean
  error: string | null
}

const initialState: AIState = {
  settings: null,
  enabled: false,
  currentChat: null,
  chatSessions: [],
  recentQueries: [],
  focusInsights: [],
  sessionSummaries: [],
  researchContext: {
    recentQueries: [],
    sessionNotes: [],
    focusAreas: []
  },
  isLoading: false,
  error: null
}

// Async thunks
export const initializeAI = createAsyncThunk(
  'ai/initialize',
  async () => {
    const settings = aiService.getSettings()
    const chatSessions = aiService.getChatSessions()
    const recentQueries = aiService.getStoredQueries()
    const sessionSummaries = aiService.getStoredSummaries()

    return {
      settings,
      chatSessions,
      recentQueries: recentQueries.slice(0, 10),
      sessionSummaries: sessionSummaries.slice(0, 5)
    }
  }
)

export const sendQuickQuery = createAsyncThunk(
  'ai/quickQuery',
  async (query: string, { rejectWithValue }) => {
    try {
      return await aiService.quickQuery(query)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Query failed')
    }
  }
)

export const sendChatMessage = createAsyncThunk(
  'ai/chatMessage',
  async ({ sessionId, message }: { sessionId: string; message: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { ai: AIState }
      const session = state.ai.chatSessions.find(s => s.id === sessionId) || state.ai.currentChat

      if (!session) {
        throw new Error('No active chat session')
      }

      const userMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      }

      const messages = [...session.messages, userMessage]
      const response = await aiService.chat(messages)

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      return {
        sessionId,
        userMessage,
        assistantMessage
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Chat message failed')
    }
  }
)

export const analyzeCurrentSession = createAsyncThunk(
  'ai/analyzeSession',
  async (sessionData: any, { rejectWithValue }) => {
    try {
      return await aiService.analyzeSession(sessionData)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Session analysis failed')
    }
  }
)

export const generateInsights = createAsyncThunk(
  'ai/generateInsights',
  async (data: any, { rejectWithValue }) => {
    try {
      return await aiService.generateFocusInsights(data)
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Insight generation failed')
    }
  }
)

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AISettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload }
      } else {
        state.settings = action.payload as AISettings
      }
      aiService.updateSettings(action.payload)
      state.enabled = state.settings?.enabled || false
    },

    createNewChat: (state, action: PayloadAction<{ title?: string; topic?: string }>) => {
      const newChat: ChatSession = {
        id: Date.now().toString(),
        title: action.payload.title || 'New Research Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (action.payload.topic) {
        state.researchContext.currentTopic = action.payload.topic
        aiService.updateResearchContext(state.researchContext)
      }

      state.currentChat = newChat
      state.chatSessions.unshift(newChat)
    },

    selectChat: (state, action: PayloadAction<string>) => {
      const chat = state.chatSessions.find(s => s.id === action.payload)
      if (chat) {
        state.currentChat = chat
      }
    },

    updateResearchContext: (state, action: PayloadAction<Partial<ResearchContext>>) => {
      state.researchContext = { ...state.researchContext, ...action.payload }
      aiService.updateResearchContext(state.researchContext)
    },

    addSessionNote: (state, action: PayloadAction<string>) => {
      state.researchContext.sessionNotes.unshift(action.payload)
      state.researchContext.sessionNotes = state.researchContext.sessionNotes.slice(0, 10)
      aiService.updateResearchContext(state.researchContext)
    },

    clearError: (state) => {
      state.error = null
    },

    dismissInsight: (state, action: PayloadAction<string>) => {
      state.focusInsights = state.focusInsights.filter(insight => insight.id !== action.payload)
    }
  },

  extraReducers: (builder) => {
    builder
      // Initialize AI
      .addCase(initializeAI.fulfilled, (state, action) => {
        state.settings = action.payload.settings
        state.enabled = action.payload.settings?.enabled || false
        state.chatSessions = action.payload.chatSessions
        state.recentQueries = action.payload.recentQueries
        state.sessionSummaries = action.payload.sessionSummaries
        state.isLoading = false
      })

      // Quick query
      .addCase(sendQuickQuery.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendQuickQuery.fulfilled, (state, action) => {
        state.isLoading = false
        state.recentQueries.unshift(action.payload)
        state.recentQueries = state.recentQueries.slice(0, 10)
        state.researchContext.recentQueries.unshift(action.payload.query)
        state.researchContext.recentQueries = state.researchContext.recentQueries.slice(0, 5)
      })
      .addCase(sendQuickQuery.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Chat message
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false
        const { sessionId, userMessage, assistantMessage } = action.payload

        // Update current chat
        if (state.currentChat && state.currentChat.id === sessionId) {
          state.currentChat.messages.push(userMessage, assistantMessage)
          state.currentChat.updatedAt = new Date()
        }

        // Update chat sessions
        const sessionIndex = state.chatSessions.findIndex(s => s.id === sessionId)
        if (sessionIndex >= 0) {
          state.chatSessions[sessionIndex].messages.push(userMessage, assistantMessage)
          state.chatSessions[sessionIndex].updatedAt = new Date()
          aiService.saveChatSession(state.chatSessions[sessionIndex])
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Session analysis
      .addCase(analyzeCurrentSession.fulfilled, (state, action) => {
        state.sessionSummaries.unshift(action.payload)
        state.sessionSummaries = state.sessionSummaries.slice(0, 5)
      })

      // Generate insights
      .addCase(generateInsights.fulfilled, (state, action) => {
        state.focusInsights = [...action.payload, ...state.focusInsights].slice(0, 10)
      })
  }
})

export const {
  updateSettings,
  createNewChat,
  selectChat,
  updateResearchContext,
  addSessionNote,
  clearError,
  dismissInsight
} = aiSlice.actions

export default aiSlice.reducer