import React, { useState, useEffect } from 'react'
import { aiService } from '../services/aiService'
import {
  MessageSquare,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Search,
  Brain,
  Target,
  Zap,
  X
} from 'lucide-react'

interface FollowUpQuestion {
  id: string
  question: string
  category: 'explore' | 'clarify' | 'apply' | 'compare' | 'analyze'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  reasoning: string
}

interface FollowUpQuestionsProps {
  lastQuery?: string
  lastResponse?: string
  context?: string
  onQuestionSelect: (question: string) => void
  onClose?: () => void
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({
  lastQuery,
  lastResponse,
  context,
  onQuestionSelect,
  onClose
}) => {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (lastQuery && lastResponse) {
      generateFollowUpQuestions()
    }
  }, [lastQuery, lastResponse, context])

  const generateFollowUpQuestions = async () => {
    if (!aiService.isEnabled() || !lastQuery || !lastResponse) return

    setLoading(true)
    try {
      const followUpPrompt = `Based on this research query and response, generate 6-8 intelligent follow-up questions that a researcher might ask to deepen their understanding.

Original Query: "${lastQuery}"
Response Summary: "${lastResponse.substring(0, 500)}..."
Research Context: "${context || 'General research'}"

Generate follow-up questions in these categories:
1. EXPLORE: Questions that expand the scope or explore related topics
2. CLARIFY: Questions that seek deeper explanation or clarification
3. APPLY: Questions about practical applications or implementation
4. COMPARE: Questions that compare with other approaches/methods
5. ANALYZE: Questions that request analysis or evaluation

Format each question as:
[CATEGORY|DIFFICULTY] Question text | Brief reasoning for why this question is valuable

Where DIFFICULTY is basic, intermediate, or advanced.

Example:
[EXPLORE|intermediate] What are the limitations of this approach in real-world scenarios? | Understanding limitations helps identify when this method is most appropriate.

Generate 6-8 diverse questions across different categories and difficulty levels.`

      const response = await aiService.quickQuery(followUpPrompt)
      const generatedQuestions = parseFollowUpQuestions(response.response)
      setQuestions(generatedQuestions)
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error)
      // Fallback to predefined questions
      setQuestions(getFallbackQuestions())
    } finally {
      setLoading(false)
    }
  }

  const parseFollowUpQuestions = (response: string): FollowUpQuestion[] => {
    const lines = response.split('\n').filter(line => line.trim() && line.includes('['))

    return lines.map((line, index) => {
      const match = line.match(/\[(\w+)\|(\w+)\]\s*(.+?)\s*\|\s*(.+)/)
      if (match) {
        const [, category, difficulty, question, reasoning] = match
        return {
          id: `follow-up-${index}`,
          question: question.trim(),
          category: category.toLowerCase() as FollowUpQuestion['category'],
          difficulty: difficulty.toLowerCase() as FollowUpQuestion['difficulty'],
          reasoning: reasoning.trim()
        }
      }

      // Fallback parsing
      const questionText = line.replace(/^\[.*?\]\s*/, '').split('|')[0].trim()
      return {
        id: `follow-up-${index}`,
        question: questionText || `Question ${index + 1}`,
        category: 'explore' as const,
        difficulty: 'intermediate' as const,
        reasoning: 'Generated question to explore the topic further'
      }
    }).filter(q => q.question.length > 10).slice(0, 8)
  }

  const getFallbackQuestions = (): FollowUpQuestion[] => {
    if (!lastQuery) return []

    return [
      {
        id: 'fallback-1',
        question: 'What are the practical applications of this in my research area?',
        category: 'apply',
        difficulty: 'intermediate',
        reasoning: 'Understanding practical applications helps bridge theory and practice'
      },
      {
        id: 'fallback-2',
        question: 'What are the main limitations or challenges with this approach?',
        category: 'analyze',
        difficulty: 'intermediate',
        reasoning: 'Identifying limitations is crucial for critical evaluation'
      },
      {
        id: 'fallback-3',
        question: 'How does this compare to alternative methods or approaches?',
        category: 'compare',
        difficulty: 'advanced',
        reasoning: 'Comparative analysis provides broader perspective'
      },
      {
        id: 'fallback-4',
        question: 'Can you provide specific examples or case studies?',
        category: 'clarify',
        difficulty: 'basic',
        reasoning: 'Examples make abstract concepts more concrete and understandable'
      },
      {
        id: 'fallback-5',
        question: 'What recent developments or trends are relevant to this topic?',
        category: 'explore',
        difficulty: 'intermediate',
        reasoning: 'Staying current with developments is essential in research'
      }
    ]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'explore': return <Search className="w-4 h-4" />
      case 'clarify': return <Lightbulb className="w-4 h-4" />
      case 'apply': return <Target className="w-4 h-4" />
      case 'compare': return <Brain className="w-4 h-4" />
      case 'analyze': return <Zap className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'explore': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'clarify': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      case 'apply': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'compare': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'analyze': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'text-green-600 dark:text-green-400'
      case 'intermediate': return 'text-yellow-600 dark:text-yellow-400'
      case 'advanced': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const filteredQuestions = selectedCategory === 'all'
    ? questions
    : questions.filter(q => q.category === selectedCategory)

  const categories = [
    { id: 'all', label: 'All Questions', icon: MessageSquare },
    { id: 'explore', label: 'Explore', icon: Search },
    { id: 'clarify', label: 'Clarify', icon: Lightbulb },
    { id: 'apply', label: 'Apply', icon: Target },
    { id: 'compare', label: 'Compare', icon: Brain },
    { id: 'analyze', label: 'Analyze', icon: Zap }
  ]

  if (!lastQuery && !loading) {
    return null
  }

  return (
    <div className="glass-card p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Follow-up Questions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suggested questions to deepen your research
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generateFollowUpQuestions}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Regenerate Questions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Generating intelligent follow-up questions...</span>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {!loading && questions.length > 0 && (
        <>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                const count = category.id === 'all' ? questions.length : questions.filter(q => q.category === category.id).length

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(question.question)}
                className="w-full p-4 text-left bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${getCategoryColor(question.category)} flex-shrink-0 mt-0.5`}>
                    {getCategoryIcon(question.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium uppercase tracking-wide ${getCategoryColor(question.category)}`}>
                        {question.category}
                      </span>
                      <span className={`text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>

                    <p className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      {question.question}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {question.reasoning}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>

          {filteredQuestions.length === 0 && selectedCategory !== 'all' && (
            <div className="text-center py-6 text-gray-600 dark:text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No questions in this category</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-2 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View all questions
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && questions.length === 0 && lastQuery && (
        <div className="text-center py-6 text-gray-600 dark:text-gray-400">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No follow-up questions generated</p>
          <button
            onClick={generateFollowUpQuestions}
            className="mt-2 text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Try generating again
          </button>
        </div>
      )}
    </div>
  )
}

export default FollowUpQuestions