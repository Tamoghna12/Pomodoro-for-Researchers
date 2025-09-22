import React, { useState } from 'react'
import { aiService } from '../services/aiService'
import {
  Brain,
  ChevronRight,
  Loader2,
  Target,
  Clock,
  BookOpen,
  BarChart3,
  FileText,
  Search
} from 'lucide-react'

interface ResearchContext {
  topic: string
  methodology: string
  timeframe: string
  goals: string[]
  challenges: string[]
  currentPhase: string
}

interface OnboardingProps {
  onComplete: (context: ResearchContext) => void
  onSkip: () => void
}

const ResearchOnboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [researchTopic, setResearchTopic] = useState('')
  const [researchContext, setResearchContext] = useState<Partial<ResearchContext>>({})
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const totalSteps = 4

  const handleTopicSubmit = async () => {
    if (!researchTopic.trim()) return

    setLoading(true)
    try {
      // Get AI insights about the research topic
      const query = `I'm researching "${researchTopic}". Please provide:
1. Key methodologies commonly used in this research area
2. Common challenges researchers face
3. Important considerations and best practices
4. Recommended focus areas for productivity

Format your response with clear bullet points for each section.`

      if (aiService.isEnabled()) {
        const response = await aiService.quickQuery(query)

        // Extract suggestions from AI response
        const suggestions = response.response.split('\n')
          .filter(line => line.trim() && (line.includes('•') || line.includes('-') || /^\d+\./.test(line.trim())))
          .map(line => line.replace(/^[•\-\d+\.\s]*/, '').trim())
          .filter(line => line.length > 10)
          .slice(0, 6)

        setAiSuggestions(suggestions)

        // Update AI context with research topic
        aiService.updateResearchContext({
          currentTopic: researchTopic,
          focusAreas: [researchTopic.split(' ').slice(0, 3).join(' ')]
        })
      }

      setResearchContext(prev => ({ ...prev, topic: researchTopic }))
      setStep(2)
    } catch (error) {
      console.error('Failed to get AI insights:', error)
      // Continue without AI insights
      setResearchContext(prev => ({ ...prev, topic: researchTopic }))
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleMethodologySelect = (methodology: string) => {
    setResearchContext(prev => ({ ...prev, methodology }))
    setStep(3)
  }

  const handlePhaseSelect = (phase: string) => {
    setResearchContext(prev => ({ ...prev, currentPhase: phase }))
    setStep(4)
  }

  const handleTimeframeSelect = async (timeframe: string) => {
    const finalContext: ResearchContext = {
      topic: researchContext.topic || '',
      methodology: researchContext.methodology || '',
      timeframe,
      goals: [],
      challenges: [],
      currentPhase: researchContext.currentPhase || 'literature-review'
    }

    // Generate AI-powered session recommendations
    if (aiService.isEnabled()) {
      try {
        const recommendationQuery = `Based on this research context:
- Topic: ${finalContext.topic}
- Methodology: ${finalContext.methodology}
- Phase: ${finalContext.currentPhase}
- Available time: ${timeframe}

Please provide:
1. 3-4 specific session goals for today
2. 2-3 potential challenges to watch for
3. Recommended focus strategies

Format as clear, actionable bullet points.`

        const response = await aiService.quickQuery(recommendationQuery)

        // Parse goals and challenges from AI response
        const lines = response.response.split('\n').filter(line => line.trim())
        const goals: string[] = []
        const challenges: string[] = []

        let currentSection = ''
        lines.forEach(line => {
          const cleanLine = line.replace(/^[•\-\d+\.\s]*/, '').trim()
          if (cleanLine.toLowerCase().includes('goal') || cleanLine.toLowerCase().includes('session')) {
            currentSection = 'goals'
          } else if (cleanLine.toLowerCase().includes('challenge') || cleanLine.toLowerCase().includes('watch')) {
            currentSection = 'challenges'
          } else if (cleanLine.length > 10 && (line.includes('•') || line.includes('-') || /^\d+\./.test(line.trim()))) {
            if (currentSection === 'goals' && goals.length < 4) {
              goals.push(cleanLine)
            } else if (currentSection === 'challenges' && challenges.length < 3) {
              challenges.push(cleanLine)
            }
          }
        })

        finalContext.goals = goals
        finalContext.challenges = challenges
      } catch (error) {
        console.error('Failed to generate AI recommendations:', error)
      }
    }

    onComplete(finalContext)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What are you researching today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us understand your research focus to provide personalized insights and optimize your workflow.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Research Topic or Project
          </label>
          <textarea
            value={researchTopic}
            onChange={(e) => setResearchTopic(e.target.value)}
            placeholder="e.g., Machine learning applications in healthcare, Climate change impact on urban planning, Quantum computing algorithms..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleTopicSubmit}
            disabled={!researchTopic.trim() || loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Skip Setup
          </button>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
            AI Insights for Your Research:
          </h4>
          <ul className="space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What's your research approach?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This helps us suggest the right tools and session types for your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: 'quantitative',
            title: 'Quantitative Research',
            description: 'Statistical analysis, surveys, experiments',
            icon: BarChart3,
            color: 'blue'
          },
          {
            id: 'qualitative',
            title: 'Qualitative Research',
            description: 'Interviews, observations, case studies',
            icon: FileText,
            color: 'purple'
          },
          {
            id: 'mixed-methods',
            title: 'Mixed Methods',
            description: 'Combining quantitative and qualitative approaches',
            icon: Target,
            color: 'emerald'
          },
          {
            id: 'literature-review',
            title: 'Literature Review',
            description: 'Systematic review of existing research',
            icon: BookOpen,
            color: 'amber'
          }
        ].map((method) => {
          const Icon = method.icon
          return (
            <button
              key={method.id}
              onClick={() => handleMethodologySelect(method.id)}
              className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors text-left group"
            >
              <div className={`w-12 h-12 bg-${method.color}-100 dark:bg-${method.color}-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-6 h-6 text-${method.color}-600 dark:text-${method.color}-400`} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {method.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What phase are you in?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We'll optimize your session types and tools for this research phase.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            id: 'literature-review',
            title: 'Literature Review',
            description: 'Finding and analyzing existing research'
          },
          {
            id: 'data-collection',
            title: 'Data Collection',
            description: 'Gathering data through experiments, surveys, or interviews'
          },
          {
            id: 'data-analysis',
            title: 'Data Analysis',
            description: 'Processing and analyzing collected data'
          },
          {
            id: 'writing',
            title: 'Writing & Documentation',
            description: 'Drafting papers, reports, or thesis chapters'
          },
          {
            id: 'revision',
            title: 'Revision & Review',
            description: 'Editing, peer review, and finalizing work'
          }
        ].map((phase) => (
          <button
            key={phase.id}
            onClick={() => handlePhaseSelect(phase.id)}
            className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              {phase.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {phase.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          How much time do you have today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We'll suggest optimal session lengths and break patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: '1-2-hours',
            title: '1-2 Hours',
            description: 'Short focused sessions',
            sessions: '2-3 x 25min sessions'
          },
          {
            id: '2-4-hours',
            title: '2-4 Hours',
            description: 'Standard research block',
            sessions: '4-6 x 25min sessions'
          },
          {
            id: '4-6-hours',
            title: '4-6 Hours',
            description: 'Deep work day',
            sessions: 'Mixed sessions with longer breaks'
          },
          {
            id: 'full-day',
            title: 'Full Day (6+ hours)',
            description: 'Intensive research marathon',
            sessions: 'Adaptive sessions with meal breaks'
          }
        ].map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => handleTimeframeSelect(timeframe.id)}
            className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors text-left group"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {timeframe.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {timeframe.description}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {timeframe.sessions}
            </p>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              Research Setup
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  )
}

export default ResearchOnboarding