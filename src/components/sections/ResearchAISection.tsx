import React, { useState } from 'react'
import {
  Brain,
  Search,
  BookOpen,
  FileText,
  Lightbulb,
  MessageSquare,
  Zap,
  TrendingUp,
  Globe,
  Database,
  Download,
  ExternalLink,
  Star,
  Clock,
  Filter,
  Users,
  Quote,
  BarChart3
} from 'lucide-react'

interface ResearchQuery {
  id: string
  query: string
  type: 'literature-search' | 'methodology' | 'analysis' | 'writing-help' | 'citation'
  timestamp: Date
  response: string
  sources?: string[]
  rating?: number
}

interface ResearchTool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'search' | 'analysis' | 'writing' | 'citation'
  premium?: boolean
}

const ResearchAISection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assistant' | 'tools' | 'history'>('assistant')
  const [query, setQuery] = useState('')
  const [queryType, setQueryType] = useState<'literature-search' | 'methodology' | 'analysis' | 'writing-help' | 'citation'>('literature-search')
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock research history
  const [researchHistory] = useState<ResearchQuery[]>([
    {
      id: '1',
      query: 'Latest research on transformer architectures in NLP',
      type: 'literature-search',
      timestamp: new Date('2024-01-15T10:30:00'),
      response: 'Found 23 relevant papers from 2023-2024. Key developments include...',
      sources: ['ArXiv', 'Google Scholar', 'PubMed'],
      rating: 5
    },
    {
      id: '2',
      query: 'Help me design a methodology for user experience research',
      type: 'methodology',
      timestamp: new Date('2024-01-14T14:20:00'),
      response: 'Here\'s a comprehensive methodology framework for UX research...',
      rating: 4
    },
    {
      id: '3',
      query: 'Analyze this dataset for statistical significance',
      type: 'analysis',
      timestamp: new Date('2024-01-13T09:15:00'),
      response: 'Statistical analysis reveals significant patterns in your data...',
      rating: 5
    }
  ])

  const researchTools: ResearchTool[] = [
    {
      id: 'literature-finder',
      name: 'Literature Finder',
      description: 'AI-powered search across academic databases',
      icon: <Search className="w-5 h-5" />,
      category: 'search'
    },
    {
      id: 'methodology-advisor',
      name: 'Methodology Advisor',
      description: 'Get guidance on research design and methodology',
      icon: <Lightbulb className="w-5 h-5" />,
      category: 'analysis'
    },
    {
      id: 'data-analyzer',
      name: 'Data Analyzer',
      description: 'Statistical analysis and data interpretation',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'analysis'
    },
    {
      id: 'writing-assistant',
      name: 'Writing Assistant',
      description: 'Academic writing support and style guidance',
      icon: <FileText className="w-5 h-5" />,
      category: 'writing'
    },
    {
      id: 'citation-manager',
      name: 'Citation Manager',
      description: 'Automatic citation generation and formatting',
      icon: <Quote className="w-5 h-5" />,
      category: 'citation'
    },
    {
      id: 'trend-analyzer',
      name: 'Trend Analyzer',
      description: 'Identify emerging trends in your research field',
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'analysis',
      premium: true
    },
    {
      id: 'collaboration-finder',
      name: 'Collaboration Finder',
      description: 'Find potential collaborators and research networks',
      icon: <Users className="w-5 h-5" />,
      category: 'search',
      premium: true
    },
    {
      id: 'grant-advisor',
      name: 'Grant Advisor',
      description: 'Assistance with grant proposals and funding',
      icon: <Star className="w-5 h-5" />,
      category: 'writing',
      premium: true
    }
  ]

  const handleSubmitQuery = async () => {
    if (!query.trim()) return

    setIsProcessing(true)

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Mock response
    const mockResponse = `AI Analysis Complete: Based on your query about "${query}", I've found several relevant insights and resources. This would include detailed analysis, citations, and actionable recommendations for your research.`

    const newQuery: ResearchQuery = {
      id: Date.now().toString(),
      query: query,
      type: queryType,
      timestamp: new Date(),
      response: mockResponse,
      sources: ['Academic Database', 'Research Papers', 'Expert Knowledge']
    }

    // In real app, this would be handled by Redux
    console.log('New research query:', newQuery)

    setIsProcessing(false)
    setQuery('')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'search':
        return <Search className="w-4 h-4" />
      case 'analysis':
        return <BarChart3 className="w-4 h-4" />
      case 'writing':
        return <FileText className="w-4 h-4" />
      case 'citation':
        return <Quote className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: ResearchQuery['type']) => {
    switch (type) {
      case 'literature-search':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'methodology':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'analysis':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'writing-help':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'citation':
        return 'bg-pink-100 text-pink-800 border-pink-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Research AI Assistant</h2>
            <p className="text-gray-600 dark:text-gray-400">AI-powered research support for academics</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-blue-600">{researchHistory.length}</div>
          <div className="text-sm text-gray-500">Queries Today</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-blue-600">156</div>
          <div className="text-sm text-gray-500">Papers Found</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-blue-600">4.8</div>
          <div className="text-sm text-gray-500">Avg Rating</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-xl font-bold text-blue-600">2.5h</div>
          <div className="text-sm text-gray-500">Time Saved</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['assistant', 'tools', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Assistant Tab */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ask Research AI</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Query Type
                </label>
                <select
                  value={queryType}
                  onChange={(e) => setQueryType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="literature-search">Literature Search</option>
                  <option value="methodology">Methodology Guidance</option>
                  <option value="analysis">Data Analysis</option>
                  <option value="writing-help">Writing Assistance</option>
                  <option value="citation">Citation Help</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Research Question
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about your research... e.g., 'Find recent papers on machine learning in healthcare' or 'Help me design a survey methodology'"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <button
                onClick={handleSubmitQuery}
                disabled={!query.trim() || isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Get AI Assistance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left">
              <Search className="w-6 h-6 text-blue-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Literature Search</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Find relevant papers and research</p>
            </button>
            <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left">
              <Lightbulb className="w-6 h-6 text-yellow-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Research Ideas</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate new research directions</p>
            </button>
            <button className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow text-left">
              <FileText className="w-6 h-6 text-green-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Writing Help</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Academic writing assistance</p>
            </button>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {researchTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                    {tool.premium && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {getCategoryIcon(tool.category)}
                  <span>{tool.category}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.description}</p>

              <button
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                  tool.premium
                    ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                }`}
              >
                {tool.premium ? 'Upgrade to Use' : 'Launch Tool'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {researchHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(item.type)}`}>
                      {item.type.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.query}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.response}</p>
                </div>
                {item.rating && (
                  <div className="flex items-center gap-1 ml-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {item.sources && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Database className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Sources:</span>
                  {item.sources.map((source, index) => (
                    <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {researchHistory.length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No research history</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your AI research queries will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResearchAISection