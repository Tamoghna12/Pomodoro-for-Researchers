import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import ResearchOnboarding from './ResearchOnboarding'
import MusicPlayer from './MusicPlayer'
import AIChat from './AIChat'
import { aiService } from '../services/aiService'
import {
  Play,
  Pause,
  RotateCcw,
  Brain,
  BookOpen,
  MessageSquare,
  Target,
  Search,
  FileText,
  Music,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2
} from 'lucide-react'

interface ResearchSession {
  type: 'literature-review' | 'data-analysis' | 'writing' | 'deep-work' | 'break'
  duration: number
  description: string
  color: string
}

interface ResearchContext {
  topic: string
  methodology: string
  timeframe: string
  goals: string[]
  challenges: string[]
  currentPhase: string
}

const ResearchWorkspace: React.FC = () => {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [currentSession, setCurrentSession] = useState<ResearchSession>({
    type: 'literature-review',
    duration: 25,
    description: 'Literature Review Session',
    color: 'emerald'
  })

  // UI state
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [researchContext, setResearchContext] = useState<ResearchContext | null>(null)

  // Research context
  const [currentGoal, setCurrentGoal] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [recentDocuments] = useState([
    { id: 1, title: 'Machine Learning in Research', type: 'PDF', status: 'reading' },
    { id: 2, title: 'Data Analysis Methods', type: 'Paper', status: 'completed' },
    { id: 3, title: 'Research Methodology', type: 'Book', status: 'bookmarked' }
  ])

  const researchSessions: ResearchSession[] = [
    {
      type: 'literature-review',
      duration: 25,
      description: 'Literature Review',
      color: 'emerald'
    },
    {
      type: 'data-analysis',
      duration: 45,
      description: 'Data Analysis',
      color: 'blue'
    },
    {
      type: 'writing',
      duration: 30,
      description: 'Academic Writing',
      color: 'purple'
    },
    {
      type: 'deep-work',
      duration: 90,
      description: 'Deep Work',
      color: 'amber'
    },
    {
      type: 'break',
      duration: 15,
      description: 'Break',
      color: 'gray'
    }
  ]

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Auto transition logic can be added here
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  // Check for first-time users and show onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('research-onboarding-completed')
    const savedContext = localStorage.getItem('research-context')

    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    } else if (savedContext) {
      try {
        const context = JSON.parse(savedContext)
        setResearchContext(context)
        // Update AI service with saved context
        aiService.updateResearchContext({
          currentTopic: context.topic,
          focusAreas: [context.topic, context.methodology].filter(Boolean)
        })
      } catch (error) {
        console.error('Failed to load research context:', error)
      }
    }
  }, [])

  const handleOnboardingComplete = (context: ResearchContext) => {
    setResearchContext(context)
    setShowOnboarding(false)

    // Save to localStorage
    localStorage.setItem('research-onboarding-completed', 'true')
    localStorage.setItem('research-context', JSON.stringify(context))

    // Update AI service with research context
    aiService.updateResearchContext({
      currentTopic: context.topic,
      focusAreas: [context.topic, context.methodology, context.currentPhase].filter(Boolean)
    })
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    localStorage.setItem('research-onboarding-completed', 'true')
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(currentSession.duration * 60)
  }

  const selectSession = (session: ResearchSession) => {
    setCurrentSession(session)
    setTimeLeft(session.duration * 60)
    setIsActive(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Quick Actions handlers
  const handleSetResearchGoal = () => {
    const goalInput = document.querySelector('input[placeholder*="accomplish"]') as HTMLInputElement
    if (goalInput) {
      goalInput.focus()
      goalInput.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleResearchLiterature = () => {
    setShowLibrary(true)
  }

  const handleTakeNotes = () => {
    const notesTextarea = document.querySelector('textarea[placeholder*="research session"]') as HTMLTextAreaElement
    if (notesTextarea) {
      notesTextarea.focus()
      notesTextarea.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Fallback: Create a simple notes dialog
      const notes = prompt('Enter your research notes:')
      if (notes) {
        setSessionNotes(prev => prev + (prev ? '\n' : '') + `[${new Date().toLocaleTimeString()}] ${notes}`)
      }
    }
  }

  const progress = ((currentSession.duration * 60 - timeLeft) / (currentSession.duration * 60)) * 100

  return (
    <div className="h-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Timer & Session Control */}
      <div className="lg:col-span-2 space-y-6">
        {/* Current Session Header */}
        <div className="glass-card p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSession.description}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isActive ? 'Session in progress' : 'Ready to start'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAIAssistant(!showAIAssistant)}
                className={`p-3 rounded-lg transition-colors ${
                  showAIAssistant
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
                title="AI Research Assistant"
              >
                <Brain className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLibrary(!showLibrary)}
                className={`p-3 rounded-lg transition-colors ${
                  showLibrary
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
                title="Research Library"
              >
                <BookOpen className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                className={`p-3 rounded-lg transition-colors ${
                  showMusicPlayer
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
                title="Focus Music"
              >
                <Music className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Session Goal Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Session Goal
            </label>
            <input
              type="text"
              value={currentGoal}
              onChange={(e) => setCurrentGoal(e.target.value)}
              placeholder="What do you want to accomplish in this session?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${progress * 2.827} 282.7`}
                  className="text-emerald-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors duration-200"
            >
              <RotateCcw className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Session Types */}
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Research Session Types
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {researchSessions.map((session) => (
              <button
                key={session.type}
                onClick={() => selectSession(session)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentSession.type === session.type
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {session.duration}m
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {session.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Notes */}
        <div className="glass-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Session Notes
          </h3>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Take notes during your research session..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
      </div>

      {/* Context Panel */}
      <div className="space-y-6">
        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <div className="h-96">
            <AIChat onClose={() => setShowAIAssistant(false)} />
          </div>
        )}

        {/* Library Panel */}
        {showLibrary && (
          <div className="glass-card p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Research Library</h4>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <Minimize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-2">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {doc.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.type} • {doc.status}
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full mt-3 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <Search className="w-4 h-4 inline mr-2" />
                Search Library
              </button>
            </div>
          </div>
        )}

        {/* Music Player Panel */}
        {showMusicPlayer && (
          <MusicPlayer onClose={() => setShowMusicPlayer(false)} />
        )}

        {/* Research Context Display */}
        {researchContext && (
          <div className="glass-card p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Research Context</h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Topic</span>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{researchContext.topic}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Method</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{researchContext.methodology.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Phase</span>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">{researchContext.currentPhase.replace('-', ' ')}</p>
                </div>
              </div>

              {researchContext.goals.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Today's Goals</span>
                  <div className="mt-1 space-y-1">
                    {researchContext.goals.slice(0, 2).map((goal, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-card p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={handleSetResearchGoal}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
            >
              <Target className="w-4 h-4" />
              Set Research Goal
            </button>
            <button
              onClick={handleResearchLiterature}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Research Literature
            </button>
            <button
              onClick={handleTakeNotes}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Take Notes
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              <Brain className="w-4 h-4" />
              Setup Research Context
            </button>
          </div>
        </div>
      </div>

      {/* Research Onboarding */}
      {showOnboarding && (
        <ResearchOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  )
}

export default ResearchWorkspace